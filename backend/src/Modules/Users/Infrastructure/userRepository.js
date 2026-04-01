const db = require("../../../Infrastructure/db");

class UserRepository {
    async findByEmail(email) {
        const result = await db.query(
            "SELECT user_id FROM users WHERE email = $1",
            [email]
        );
        return result.rows[0] || null;
    }

    async create(userData) {
        const { name, surname, email, phone, birthDate, passwordHash } = userData;

        const result = await db.query(
            `INSERT INTO users (name, surname, email, phone, birth_date, password_hash)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING user_id, name, surname, email, phone, birth_date, created_at`,
            [name, surname, email, phone, birthDate, passwordHash]
        );

        return result.rows[0];
    }
}

module.exports = new UserRepository();