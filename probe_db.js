const { Client } = require('pg');

async function check() {
  const configs = [
    { user: 'admin', password: 'adminpassword', database: 'financedb' },
    { user: 'postgres', password: '', database: 'postgres' },
    { user: 'postgres', password: 'password', database: 'postgres' },
    { user: 'postgres', password: 'postgresspassword', database: 'postgres' },
  ];

  for (const config of configs) {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      ...config
    });
    try {
      await client.connect();
      console.log(`Connected successfully with ${config.user}:${config.password} to ${config.database}`);
      
      const dbs = await client.query('SELECT datname FROM pg_database');
      console.log('Databases:', dbs.rows.map(r => r.datname));
      
      const users = await client.query('SELECT usename FROM pg_user');
      console.log('Users:', users.rows.map(r => r.usename));

      await client.end();
      break;
    } catch (err) {
      console.log(`Failed with ${config.user}:${config.password}: ${err.message}`);
    }
  }
}

check();
