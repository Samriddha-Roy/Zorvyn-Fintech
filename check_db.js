const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const connectionString = process.env.DATABASE_URL;
console.log('Connecting to:', connectionString);

const pool = new Pool({ connectionString });

async function check() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('Tables found:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Error connecting to DB:', err.message);
  } finally {
    await pool.end();
  }
}

check();
