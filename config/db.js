const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Use the environment variable or default to the hardcoded URL
const pool = mysql.createPool({
    uri: process.env.MYSQL_URL || 'mysql://root:RCOHZjRChIntEFvRrNZtyapXbNMDSrDs@mysql.railway.internal:3306/railway'
});

// Export the promise-based pool
module.exports = pool.promise();
