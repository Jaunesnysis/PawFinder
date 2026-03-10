const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;

//veliau backend palesti npm install pg  ir prideti .env faila su DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT reiksmemis. Ir tada jau galima naudoti db.js faila prisijungimui prie duomenu bazes.
//tokiam paciam lygi kaip server.js, galima sukurti db.js ir ten sukonfiguruoti duomenu bazes prisijungima. Ir tada jau galima naudoti db.js faila prisijungimui prie duomenu bazes.
