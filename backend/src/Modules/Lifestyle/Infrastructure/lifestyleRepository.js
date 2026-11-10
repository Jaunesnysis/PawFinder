const db = require("../../../Infrastructure/db");

const findDescriptionByUserId = async (userId) => {
  const query = `
    SELECT user_id, life_description
    FROM users
    WHERE user_id = $1
  `;

  try {
    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`[lifestyleRepository.findDescriptionByUserId] ${error.message}`);
  }
};

const findTagNamesByUserId = async (userId) => {
  const query = `
    SELECT t.tag_name
    FROM user_tag ut
    JOIN tag t ON t.tag_id = ut.tag_id
    WHERE ut.user_id = $1
    ORDER BY t.tag_name
  `;

  try {
    const result = await db.query(query, [userId]);
    return result.rows.map((row) => row.tag_name);
  } catch (error) {
    throw new Error(`[lifestyleRepository.findTagNamesByUserId] ${error.message}`);
  }
};

/**
 * Išsaugo aprašymą. Jei tekstas pasikeitė, ištriname vartotojo tagus,
 * kad nebūtų rodomi pasiūlymai pagal seną aprašymą (DI juos sugeneruos iš naujo).
 * Viena užklausa, todėl abu pakeitimai įvyksta kartu.
 */
const saveDescription = async (userId, description) => {
  const query = `
    WITH previous AS (
        SELECT life_description FROM users WHERE user_id = $2::bigint
    ),
    cleared_tags AS (
        DELETE FROM user_tag
        WHERE user_id = $2::bigint
          AND EXISTS (
              SELECT 1 FROM previous
              WHERE previous.life_description IS DISTINCT FROM $1::varchar
          )
    )
    UPDATE users
    SET life_description = $1::varchar
    WHERE user_id = $2::bigint
    RETURNING user_id, life_description
  `;

  try {
    const result = await db.query(query, [description, userId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`[lifestyleRepository.saveDescription] ${error.message}`);
  }
};

/**
 * Laisvi gyvūnai, turintys bent vieną bendrą tagą su vartotoju.
 * Pirmiausia tie, kurių sutampa daugiausia tagų.
 */
const findSuggestedPets = async (userId, limit = 20) => {
  const query = `
    SELECT p.*, COUNT(*)::int AS matched_tags
    FROM user_tag ut
    JOIN pet_tag pt ON pt.tag_id = ut.tag_id
    JOIN pets p ON p.pet_id = pt.pet_id
    WHERE ut.user_id = $1
      AND p.status = 'available'
    GROUP BY p.pet_id
    ORDER BY matched_tags DESC, p.created_at DESC
    LIMIT $2
  `;

  try {
    const result = await db.query(query, [userId, limit]);
    return result.rows;
  } catch (error) {
    throw new Error(`[lifestyleRepository.findSuggestedPets] ${error.message}`);
  }
};

module.exports = {
  findDescriptionByUserId,
  findTagNamesByUserId,
  saveDescription,
  findSuggestedPets,
};
