const db = require('../../../Infrastructure/db');
const {User} = require('../Domain/User')
const {Achievement} = require("../../Achievements/Domain/Achievement");

const findByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';

    try {
        const result = await db.query(query, [email]);
        const row = result.rows[0];

        if (!row) return null;

        // Grąžiname User klasės objektą
        return new User(
            row.user_id, row.name, row.surname, row.email, row.phone,
            row.birth_date, row.password_hash, row.role, row.city,
            row.points, row.last_earned_at, row.created_at, row.consent_given_at
        );
    } catch (error) {
        throw new Error(`[userRepository.findByEmail] ${error.message}`);
    }
};

const findById = async (userId) => {
    const query = 'SELECT * FROM users WHERE user_id = $1';

    try{
        const result = await db.query(query, [userId]);
        const row = result.rows[0];

        if(!row) return null;

        return new User(
            row.user_id,
            row.name,
            row.surname,
            row.email,
            row.phone,
            row.birth_date,
            row.password_hash,
            row.role,
            row.city,
            row.points,
            row.last_earned_at,
            row.created_at,
            row.consent_given_at
        );

    }catch (error) {
        console.error("Klaida userRepository.findById:", error);
        throw error;
    }
}

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
        user.id
    ];
    try {
        const result = await db.query(query, values);
        return result.rows[0]; // Grąžiname atnaujintus duomenis patvirtinimui
    } catch (error) {
        console.error("Klaida userRepository.update:", error);
        throw error;
    }
}
module.exports = {update, findById, findByEmail};