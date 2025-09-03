// db.js
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
   host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }, // IMPORTANT for Supabase
});

(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to local PostgreSQL successfully!");
    client.release();
  } catch (err) {
    console.error("❌ Error connecting to local PostgreSQL:", err.message);
  }
})();

module.exports = pool;
