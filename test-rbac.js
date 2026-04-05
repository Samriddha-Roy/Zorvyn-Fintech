require('dotenv').config();
const { Client } = require('pg');

const apiUrl = 'http://localhost:3000';

async function bootstrapAdmin(email) {
  const client = new Client({
    connectionString: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  await client.query('UPDATE "User" SET role = $1 WHERE email = $2', ['ADMIN', email]);
  await client.end();
}

async function registerAndLogin(email, password = 'Password123!') {
  console.log(`  Registering/Login for ${email}...`);
  const regRes = await fetch(`${apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, firstName: 'Test', lastName: 'User' })
  });
  if (!regRes.ok) {
    const errorBody = await regRes.text();
    if (regRes.status !== 409) {
      console.error(`  Registration failed: ${regRes.status} ${errorBody}`);
    }
  }

  const res = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return { token: data.accessToken, user: data.user };
}

async function runRbacTests() {
  console.log('--- Starting RBAC E2E Tests ---');
  
  const adminEmail = `admin_${Date.now()}@example.com`;
  const analystEmail = `analyst_${Date.now()}@example.com`;
  const viewerEmail = `viewer_${Date.now()}@example.com`;

  try {
    // 1. Create ADMIN
    console.log('1. Setting up Admin...');
    const adminSession = await registerAndLogin(adminEmail);
    console.log(`  Upgrading ${adminEmail} to ADMIN in database...`);
    await bootstrapAdmin(adminEmail);
    
    // Re-login Admin to get updated token with ADMIN role
    const adminSessionUpdated = await registerAndLogin(adminEmail);
    const adminToken = adminSessionUpdated.token;
    console.log('  Admin setup complete.');

    // 2. Create ANALYST and VIEWER
    console.log('2. Setting up Analyst and Viewer...');
    const analystSession = await registerAndLogin(analystEmail);
    const viewerSession = await registerAndLogin(viewerEmail);
    
    // Upgrade analyst using Admin endpoint!
    console.log(`  Upgrading ${analystEmail} using Admin endpoint...`);
    const upgradeRes = await fetch(`${apiUrl}/users/${analystSession.user.id}/role`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ role: 'ANALYST' })
    });
    if (!upgradeRes.ok) throw new Error('Admin could not upgrade Analyst: ' + upgradeRes.status + ' ' + await upgradeRes.text());
    
    // Re-login Analyst to get updated token with ANALYST role
    const analystSessionUpdated = await registerAndLogin(analystEmail);
    const analystToken = analystSessionUpdated.token;
    const viewerToken = viewerSession.token;
    console.log('  Analyst and Viewer setup complete.');

    // --- TEST ACCESS ---

    console.log('3. Testing VIEWER protections...');
    // Viewer tries to create tx (Should Fail)
    let resTx = await fetch(`${apiUrl}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${viewerToken}` },
      body: JSON.stringify({ amount: 100, type: 'INCOME', category: 'Test', date: new Date().toISOString() })
    });
    console.log(`  POST /transactions (Viewer): ${resTx.status}`);
    if (resTx.status !== 403) throw new Error('Viewer was able to create a transaction! expected 403, got ' + resTx.status);
    
    // Viewer tries to get transactions (Should Fail)
    let resGetTx = await fetch(`${apiUrl}/transactions`, {
      headers: { 'Authorization': `Bearer ${viewerToken}` }
    });
    console.log(`  GET /transactions (Viewer): ${resGetTx.status}`);
    if (resGetTx.status !== 403) throw new Error('Viewer was able to list transactions! expected 403, got ' + resGetTx.status);
    console.log('  ✅ Viewer accurately blocked from Records & Control Panel');

    console.log('4. Testing ANALYST protections...');
    // Analyst tries to get transactions (Should Succeed)
    let resAnalystGet = await fetch(`${apiUrl}/transactions`, {
      headers: { 'Authorization': `Bearer ${analystToken}` }
    });
    console.log(`  GET /transactions (Analyst): ${resAnalystGet.status}`);
    if (resAnalystGet.status !== 200) throw new Error('Analyst could not view transactions! expected 200, got ' + resAnalystGet.status + ' ' + await resAnalystGet.text());

    // Analyst tries to create tx (Should Fail)
    let resAnalystPost = await fetch(`${apiUrl}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${analystToken}` },
      body: JSON.stringify({ amount: 100, type: 'INCOME', category: 'Test', date: new Date().toISOString() })
    });
    console.log(`  POST /transactions (Analyst): ${resAnalystPost.status}`);
    if (resAnalystPost.status !== 403) throw new Error('Analyst was able to create transaction! expected 403, got ' + resAnalystPost.status);
    console.log('  ✅ Analyst accurately blocked from Control Panel but can view Records');

    console.log('5. Testing ADMIN protections...');
    let resAdminPost = await fetch(`${apiUrl}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ amount: 1000, type: 'INCOME', category: 'Testing', date: new Date().toISOString(), notes: 'Test' })
    });
    console.log(`  POST /transactions (Admin): ${resAdminPost.status}`);
    if (resAdminPost.status !== 201) throw new Error('Admin failed to create transaction! expected 201, got ' + resAdminPost.status + ' ' + await resAdminPost.text());
    
    let txData = await resAdminPost.json();
    let resAdminDel = await fetch(`${apiUrl}/transactions/${txData.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`  DELETE /transactions/${txData.id} (Admin): ${resAdminDel.status}`);
    if (resAdminDel.status !== 200) throw new Error('Admin failed to delete transaction! expected 200, got ' + resAdminDel.status);
    console.log('  ✅ Admin successfully accessed full Control Panel');

    console.log('--- ALL RBAC TESTS PASSED SUCCESSFULLY! ---');

  } catch (err) {
    console.error('--- RBAC TEST FAILED ---');
    console.error(err.message);
  }
}

runRbacTests();
