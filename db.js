const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',        // MySQL server
  user: 'root',             // Root user
  password: 'SQL!10&Fab2', // Your MySQL root password
  database: 'ecommerce',    // Database you created
  port: 3306,               // Default MySQL port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the pool using promise API for async/await
module.exports = pool.promise();
