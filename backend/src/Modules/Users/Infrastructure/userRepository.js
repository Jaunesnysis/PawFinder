const db = require("../../../Infrastructure/db");
const { User } = require("../Domain/User");

const findByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";

  try {
    const result = await db.query(query, [email]);
    const row = result.rows[0];

    if (!row) return null;

    // Grąžiname User klasės objektą
    return new User(row);
  } catch (error) {
    throw new Error(`[userRepository.findByEmail] ${error.message}`);
  }
};

const findById = async (userId) => {
  const query = "SELECT * FROM users WHERE user_id = $1";

  try {
    const result = await db.query(query, [userId]);
    const row = result.rows[0];

    if (!row) return null;

    return new User(row);
  } catch (error) {
    console.error("Klaida userRepository.findById:", error);
    throw error;
  }
};

const update = async (user) => {
  const query = `
        UPDATE users 
        SET
            name = $1,
            surname = $2,
            email = $3,
            phone = $4,
            city = $5,
            points = $6,
            last_earned_at = $7
        WHERE user_id = $8
        RETURNING *
    `;
  const values = [
    user.name,
    user.surname,
    user.email,
    user.phone,
    user.city,
    user.points,
    user.last_earned_at,
    user.id,
  ];
  try {
    const result = await db.query(query, values);
    return result.rows[0]; // Grąžiname atnaujintus duomenis patvirtinimui
  } catch (error) {
    console.error("Klaida userRepository.update:", error);
    throw error;
  }
};

const create = async (userData) => {
  const { name, surname, email, phone, birthDate, passwordHash } = userData;

  const result = await db.query(
    `INSERT INTO users (name, surname, email, phone, birth_date, password_hash)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING user_id, name, surname, email, phone, birth_date, created_at`,
    [name, surname, email, phone, birthDate, passwordHash],
  );

  return result.rows[0];
};

const getTopUsersByPoints = async (limit = 10) => {
  const query = `
        SELECT user_id, name, surname, city, points, last_earned_at
        FROM users
        ORDER BY points DESC
        LIMIT $1
    `;
  try {
    const result = await db.query(query, [limit]);
    return result.rows;
  } catch (error) {
    throw new Error(`[userRepository.getTopUsersByPoints] ${error.message}`);
  }
};

module.exports = { update, findById, findByEmail, create, getTopUsersByPoints };
