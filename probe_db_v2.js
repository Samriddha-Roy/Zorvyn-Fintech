const { Client } = require('pg');

async function check() {
  const configs = [
    { user: 'postgres', password: 'adminpassword', database: 'postgres' },
    { user: 'admin', password: 'password', database: 'postgres' },
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
      await client.end();
      return;
    } catch (err) {
      console.log(`Failed with ${config.user}:${config.password}: ${err.message}`);
    }
  }
}

check();
