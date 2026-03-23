require("dotenv").config();
const pool = require("./src/Infrastructure/db");

async function test() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connected:", result.rows[0]);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

test();
