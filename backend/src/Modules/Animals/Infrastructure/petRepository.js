const { get } = require("../API/petRoutes");

const mockPetsFull = [
    {
        pet_id: 1,
        shelter_id: 101,
        name: "Pukis",
        species: "Šuo",
        breed: "Auksaspalvis retriveris",
        age: 3,
        size: "Didelis",
        weight: 30.5,
        activity_level: "Aukštas",
        health_info: "Sveikas, paskiepytas",
        status: "Laisvas",
        city: "Vilnius",
        shelter_description: "Draugiškas šuo, ieškantis aktyvios šeimos.",
        ai_description: "Rikis yra energingas retriveris, kuris dievina žaidimus lauke.",
        created_at: "2024-01-10T12:00:00Z",
        updated_at: "2024-03-01T10:30:00Z"
    },
    {
        pet_id: 2,
        shelter_id: 102,
        name: "Mika",
        species: "Katė",
        breed: "Siamo",
        age: 2,
        size: "Mažas",
        weight: 4.2,
        activity_level: "Vidutinis",
        health_info: "Turi alergiją tam tikram maistui",
        status: "Laisvas",
        city: "Kaunas",
        shelter_description: "Rami katė, mėgstanti šilumą.",
        ai_description: "Elegantiška Siamo katė, vertinanti ramybę ir žmogaus draugiją.",
        created_at: "2024-02-15T09:15:00Z",
        updated_at: "2024-03-05T14:20:00Z"
    },
    {
        pet_id: 3,
        shelter_id: 101,
        name: "Bosas",
        species: "Šuo",
        breed: "Vokiečių aviganis",
        age: 5,
        size: "Didelis",
        weight: 35.0,
        activity_level: "Aukštas",
        health_info: "Sveikas, dresuotas",
        status: "Rezervuotas",
        city: "Vilnius",
        shelter_description: "Puikus sargas ir ištikimas draugas.",
        ai_description: "Išmintingas aviganis, pasižymintis puikiu paklusnumu.",
        created_at: "2023-11-20T08:00:00Z",
        updated_at: "2024-03-10T11:00:00Z"
    },
    {
        pet_id: 4,
        shelter_id: 101,
        name: "Murka",
        species: "Katė",
        breed: "Mišrūnė",
        age: 1,
        size: "Mažas",
        weight: 3.5,
        activity_level: "Aukštas",
        health_info: "Labai energinga",
        status: "Laisvas",
        city: "Vilnius",
        shelter_description: "Maža išdykėlė, mėgstanti karstytis.",
        ai_description: "Jauna ir žaisminga katytė, kuri niekada nenuobodžiauja.",
        created_at: "2024-03-01T16:00:00Z",
        updated_at: "2024-03-12T09:45:00Z"
    },
    {
        pet_id: 5,
        shelter_id: 103,
        name: "Lakis",
        species: "Šuo",
        breed: "Taksas",
        age: 4,
        size: "Mažas",
        weight: 8.0,
        activity_level: "Vidutinis",
        health_info: "Reikalinga speciali nugaros priežiūra",
        status: "Laisvas",
        city: "Vilnius",
        shelter_description: "Drąsus mažas šuo su didele širdimi.",
        ai_description: "Klasikinis taksas su charakteriu ir begaliniu smalsumu.",
        created_at: "2024-01-25T13:20:00Z",
        updated_at: "2024-03-14T17:10:00Z"
    },
    {
        pet_id: 6,
        shelter_id: 103,
        name: "Perla",
        species: "Katė",
        breed: "Persų",
        age: 6,
        size: "Vidutinis",
        weight: 5.5,
        activity_level: "Žemas",
        health_info: "Reikalingas kasdienis kailio šukavimas",
        status: "Laisvas",
        city: "Vilnius",
        shelter_description: "Prabangaus kailio savininkė, ieškanti ramių namų.",
        ai_description: "Karališka persų katė, kuri mėgsta būti dėmesio centre.",
        created_at: "2023-12-05T10:00:00Z",
        updated_at: "2024-03-15T08:00:00Z"
    }
];

const mockPets = [
    { pet_id: 1, name: "Rikis", city: "Vilnius", status: "Laisvas", species: "Šuo" },
    { pet_id: 2, name: "Mika", city: "Kaunas", status: "Laisvas", species: "Katė" },
    { pet_id: 3, name: "Bosas", city: "Vilnius", status: "Rezervuotas", species: "Šuo" },
    { pet_id: 4, name: "Murka", city: "Vilnius", status: "Laisvas", species: "Katė" },
    { pet_id: 5, name: "Lakis", city: "Vilnius", status: "Laisvas", species: "Šuo" },
    { pet_id: 6, name: "Perla", city: "Vilnius", status: "Laisvas", species: "Katė" }
];

// Funkcija, kurią vėliau pakeisime į SQL užklausą
const findAvailableByCity = async (city) => {
    return mockPets.filter(pet =>
    pet.status === "Laisvas" &&
    pet.city.toLowerCase() === city.toLowerCase()
    );
}

const getAllAvailablePets = async (filters = {}) => {
    let pets = mockPetsFull;

    // Taikome filtrus jei jie yra
    if (filters.species) {
        pets = pets.filter(pet => pet.species === filters.species);
    }
    if (filters.breed) {
        pets = pets.filter(pet => pet.breed === filters.breed);
    }
    if (filters.size) {
        pets = pets.filter(pet => pet.size === filters.size);
    }
    if (filters.activity) {
        pets = pets.filter(pet => pet.activity_level === filters.activity);
    }
    if (filters.city) {
        pets = pets.filter(pet => pet.city === filters.city);
    }
    if (filters.ageMin) {
        pets = pets.filter(pet => Number(pet.age) >= Number(filters.ageMin));
    }
    if (filters.ageMax) {
        pets = pets.filter(pet => Number(pet.age) <= Number(filters.ageMax));
    }
    if (filters.weightMin) {
        pets = pets.filter(pet => Number(pet.weight) >= Number(filters.weightMin));
    }
    if (filters.weightMax) {
        pets = pets.filter(pet => Number(pet.weight) <= Number(filters.weightMax));
    }

    return pets;
}

const findAvailableByShelterId = async (shelterId) => {
    return mockPetsFull.filter(pet => pet.status === "Laisvas" && Number(pet.shelter_id) === Number(shelterId));
};

/*
const findAvailableByCity = async (city) => {
    const result = await db.query(
        "SELECT * FROM pets WHERE status = 'Laisvas' AND city = $1",
        [city]
    );
    return result.rows;
};
 */

let mockReservations = [];
let nextReservationId = 1;

const createReservation = async (reservation) => {
    const pet = mockPetsFull.find(p => p.pet_id === reservation.pet_id);
    if (!pet) throw new Error('Pet not found');
    if (pet.status !== 'Laisvas') throw new Error('Pet not available');

    const newReservation = {
        reservation_id: nextReservationId++,
        ...reservation,
        status: 'pending',
        created_at: new Date(),
        cancelled_at: null
    };
    mockReservations.push(newReservation);
    return newReservation;
};

const cancelReservation = async (reservationId) => {
    const reservation = mockReservations.find(r => r.reservation_id === reservationId);
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.status === 'cancelled') throw new Error('Already cancelled');

    reservation.status = 'cancelled';
    reservation.cancelled_at = new Date();
    return reservation;
};

const getReservationById = async (reservationId) => {
    return mockReservations.find(r => r.reservation_id === reservationId);
};

module.exports = { findAvailableByCity, getAllAvailablePets, findAvailableByShelterId, createReservation, cancelReservation, getReservationById };