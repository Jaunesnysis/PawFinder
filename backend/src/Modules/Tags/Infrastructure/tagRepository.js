// Bendras žymų žodynas (lentelė "tag"). Kešuojama 10 min., nes žymos keičiasi retai.

const db = require("../../../Infrastructure/db");

const CACHE_TTL = 10 * 60 * 1000;
let cache = { names: null, fetchedAt: 0 };

const getAllTagNames = async () => {
  if (cache.names && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return cache.names;
  }

  try {
    const result = await db.query("SELECT tag_name FROM tag ORDER BY tag_name");
    cache = { names: result.rows.map((r) => r.tag_name), fetchedAt: Date.now() };
    return cache.names;
  } catch (error) {
    throw new Error(`[tagRepository.getAllTagNames] ${error.message}`);
  }
};

const clearCache = () => {
  cache = { names: null, fetchedAt: 0 };
};

module.exports = { getAllTagNames, clearCache };
