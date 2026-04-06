// const { get } = require("../API/petRoutes");
const db = require("../../../Infrastructure/db"); // Įsitikink, kad taškų kiekis teisingas
const { Pet } = require("../Domain/Pet");

const mockPets = [
  {
    pet_id: 1,
    name: "Rikis",
    city: "Vilnius",
    status: "Laisvas",
    species: "Šuo",
  },
  {
    pet_id: 2,
    name: "Mika",
    city: "Kaunas",
    status: "Laisvas",
    species: "Katė",
  },
  {
    pet_id: 3,
    name: "Bosas",
    city: "Vilnius",
    status: "Rezervuotas",
    species: "Šuo",
  },
  {
    pet_id: 4,
    name: "Murka",
    city: "Vilnius",
    status: "Laisvas",
    species: "Katė",
  },
  {
    pet_id: 5,
    name: "Lakis",
    city: "Vilnius",
    status: "Laisvas",
    species: "Šuo",
  },
  {
    pet_id: 6,
    name: "Perla",
    city: "Vilnius",
    status: "Laisvas",
    species: "Katė",
  },
];

// Funkcija, kurią vėliau pakeisime į SQL užklausą
/*
const findAvailableByCity = async (city) => {
    return mockPetsFull.filter(pet =>
    pet.status === "Laisvas" &&
    pet.city.toLowerCase() === city.toLowerCase()
    );
}
 */
const findAvailableByCity = async (city) => {
  const result = await db.query(
    "SELECT * FROM pets WHERE status = 'available' AND city = $1",
    [city],
  );

  const petObjects = result.rows.map((row) => {
    return new Pet(
      row.pet_id,
      row.shelter_id,
      row.name,
      row.species,
      row.breed,
      row.age,
      row.size,
      row.weight,
      row.activity_level,
      row.health_info,
      row.status,
      row.city,
      row.shelter_description,
      row.ai_description,
      row.created_at,
      row.updated_at,
    );
  });
  return petObjects;
};

const getAllAvailablePets = async (filters = {}) => {
  let query = "SELECT * FROM pets WHERE status = 'available'";
  const values = [];
  let index = 1;

  if (filters.species) {
    query += ` AND species = $${index++}`;
    values.push(filters.species);
  }

  if (filters.breed) {
    query += ` AND breed = $${index++}`;
    values.push(filters.breed);
  }

  if (filters.size) {
    query += ` AND size = $${index++}`;
    values.push(filters.size);
  }

  if (filters.activity) {
    query += ` AND activity_level = $${index++}`;
    values.push(filters.activity);
  }

  if (filters.city) {
    query += ` AND city = $${index++}`;
    values.push(filters.city);
  }

  if (filters.ageMin) {
    query += ` AND age >= $${index++}`;
    values.push(Number(filters.ageMin));
  }

  if (filters.ageMax) {
    query += ` AND age <= $${index++}`;
    values.push(Number(filters.ageMax));
  }

  if (filters.weightMin) {
    query += ` AND weight >= $${index++}`;
    values.push(Number(filters.weightMin));
  }

  if (filters.weightMax) {
    query += ` AND weight <= $${index++}`;
    values.push(Number(filters.weightMax));
  }

  const result = await db.query(query, values);

  return result.rows.map(
    (row) =>
      new Pet(
        row.pet_id,
        row.shelter_id,
        row.name,
        row.species,
        row.breed,
        row.age,
        row.size,
        row.weight,
        row.activity_level,
        row.health_info,
        row.status,
        row.city,
        row.shelter_description,
        row.ai_description,
        row.created_at,
        row.updated_at
      )
  );
};

const findAvailableByShelterId = async (shelterId) => {
  const result = await db.query(
    "SELECT * FROM pets WHERE status = 'available' AND shelter_id = $1",
    [shelterId]
  );

  return result.rows.map(
    (row) =>
      new Pet(
        row.pet_id,
        row.shelter_id,
        row.name,
        row.species,
        row.breed,
        row.age,
        row.size,
        row.weight,
        row.activity_level,
        row.health_info,
        row.status,
        row.city,
        row.shelter_description,
        row.ai_description,
        row.created_at,
        row.updated_at
      )
  );
};

let mockReservations = [];
let nextReservationId = 1;

const createReservation = async (reservation) => {
  const pet = mockPetsFull.find((p) => p.pet_id === reservation.pet_id);
  if (!pet) throw new Error("Pet not found");
  if (pet.status !== "Laisvas") throw new Error("Pet not available");

  const newReservation = {
    reservation_id: nextReservationId++,
    ...reservation,
    status: "pending",
    created_at: new Date(),
    cancelled_at: null,
  };
  mockReservations.push(newReservation);
  return newReservation;
};

const cancelReservation = async (reservationId) => {
  const reservation = mockReservations.find(
    (r) => r.reservation_id === reservationId,
  );
  if (!reservation) throw new Error("Reservation not found");
  if (reservation.status === "cancelled") throw new Error("Already cancelled");

  reservation.status = "cancelled";
  reservation.cancelled_at = new Date();
  return reservation;
};

const getReservationById = async (reservationId) => {
  return mockReservations.find((r) => r.reservation_id === reservationId);
};

module.exports = {
  findAvailableByCity,
  getAllAvailablePets,
  findAvailableByShelterId,
  createReservation,
  cancelReservation,
  getReservationById,
};
