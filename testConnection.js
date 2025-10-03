const pool = require('./db');

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    console.log('Connected! Current time:', rows[0].now);
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();
