const mockPets = [
    { pet_id: 1, name: "Rikis", city: "Vilnius", status: "Laisvas", species: "Šuo" },
    { pet_id: 2, name: "Mika", city: "Kaunas", status: "Laisvas", species: "Katė" },
    { pet_id: 3, name: "Bosas", city: "Vilnius", status: "Rezervuotas", species: "Šuo" },
    { pet_id: 4, name: "Murka", city: "Vilnius", status: "Laisvas", species: "Katė" }
];

// Funkcija, kurią vėliau pakeisime į SQL užklausą
const findAvailableByCity = async (city) => {
    return mockPets.filter(pet =>
    pet.status === "Laisvas" &&
    pet.city.toLowerCase() === city.toLowerCase()
    );
}
/*
const findAvailableByCity = async (city) => {
    const result = await db.query(
        "SELECT * FROM pets WHERE status = 'Laisvas' AND city = $1",
        [city]
    );
    return result.rows;
};
 */

module.exports = { findAvailableByCity };