const shelterRepository = require('../Infrastructure/shelterRepository');
const petRepository = require('../../Animals/Infrastructure/petRepository');

/**
 * Returns shelter profile with associated active pets.
 * This is where we apply transformation/formatting logic before sending to the client.
 */
const getShelterProfile = async (shelterId) => {
    const shelter = await shelterRepository.findShelterById(shelterId);
    if (!shelter) {
        return null;
    }

    // We only return active pets (status === "Laisvas") for this shelter
    const shelterPets = await petRepository.findAvailableByShelterId(shelterId);

    // Format contact info consistently to make frontend rendering easier
    const formattedContact = {
        email: shelter.contact.email || null,
        phone: shelter.contact.phone || null,
        address: shelter.contact.address || null,
        website: shelter.contact.website || null,
    };

    return {
        shelter_id: shelter.shelter_id,
        name: shelter.name,
        description: shelter.description,
        city: shelter.city,
        contact: formattedContact,
        pets: shelterPets
    };
};

module.exports = { getShelterProfile };