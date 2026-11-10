const db = require('../../../Infrastructure/db');

const mapShelter = (row) => ({
    shelter_id: row.shelter_id,
    name: row.name,
    description: row.description,
    city: row.city,
    donation_account: row.donation_account || null, // <-- PRIDĖTI ČIA
    contact: {
        email: row.email || null,
        phone: row.phone || null,
        address: row.address || null,
        website: null
    }
});

const registerShelter = async (shelter) => {
    const query = `
        INSERT INTO shelters (name, description, city, address, email, phone, donation_account)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING shelter_id
    `;

    const result = await db.query(query, [
        shelter.name,
        shelter.description,
        shelter.city,
        shelter.address,
        shelter.email,
        shelter.phone,
        shelter.donation_account
    ]);

    return result.rows[0].shelter_id;
};

const findShelterById = async (shelterId) => {
    const query = `
        SELECT 
            shelter_id,
            name,
            description,
            city,
            address,
            email,
            phone
        FROM shelters
        WHERE shelter_id = $1
    `;

    const result = await db.query(query, [shelterId]);

    if (result.rows.length === 0) {
        return null;
    }

    return mapShelter(result.rows[0]);
};

const getAllShelters = async () => {
    const query = `
        SELECT 
            shelter_id,
            name,
            description,
            city,
            address,
            email,
            phone
        FROM shelters
        ORDER BY shelter_id
    `;

    const result = await db.query(query);

    return result.rows.map(mapShelter);
};

module.exports = {
    findShelterById,
    getAllShelters,
    registerShelter
}; 