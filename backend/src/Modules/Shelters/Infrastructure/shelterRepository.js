// Mocked shelter data - replace with real DB calls later
const mockShelters = [
    {
        shelter_id: 101,
        name: "Vilnius City Shelter",
        description: "A welcoming shelter in Vilnius focused on socializing dogs and cats for adoption.",
        city: "Vilnius",
        contact: {
            email: "info@vilniusshelter.lt",
            phone: "+370 612 34567",
            address: "Gedimino pr. 3, Vilnius",
            website: "https://vilniusshelter.lt"
        }
    },
    {
        shelter_id: 102,
        name: "Kaunas Animal Home",
        description: "Small shelter in Kaunas caring for senior pets and special-needs animals.",
        city: "Kaunas",
        contact: {
            email: "kontaktai@kaunasshelter.lt",
            phone: "+370 698 12345",
            address: "Laisvės al. 10, Kaunas",
            website: "https://kaunasshelter.lt"
        }
    },
    {
        shelter_id: 103,
        name: "Šiauliai Pet Rescue",
        description: "Community-driven rescue providing temporary homes and training support.",
        city: "Šiauliai",
        contact: {
            email: "info@siauliupets.lt",
            phone: "+370 611 98765",
            address: "Tilžės g. 50, Šiauliai",
            website: "https://siauliupets.lt"
        }
    }
];

const findShelterById = async (shelterId) => {
    return mockShelters.find(s => Number(s.shelter_id) === Number(shelterId)) || null;
};

// Placeholder for when we replace mock data with a real DB
/*
const findShelterById = async (shelterId) => {
    const result = await db.query(
        "SELECT * FROM shelters WHERE shelter_id = $1",
        [shelterId]
    );
    return result.rows[0] || null;
};
*/

module.exports = { findShelterById };