const db = require('../../../Infrastructure/db');

const mapShelter = (row) => ({
    shelter_id: row.shelter_id,
    name: row.name,
    description: row.description,
    city: row.city,
    contact: {
        email: row.email || null,
        phone: row.phone || null,
        address: row.address || null,
        website: null
    }
});

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
    getAllShelters
}; 