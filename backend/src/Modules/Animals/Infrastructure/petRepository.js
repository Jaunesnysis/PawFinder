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
    const query = `
        SELECT p.*, 
        COALESCE(
            (SELECT json_agg(json_build_object(
                'image_id', img.image_id, 
                'url', img.image_url, 
                'is_primary', img.is_primary
            )) 
             FROM pet_images img 
             WHERE img.pet_id = p.pet_id), 
        '[]') as images
        FROM pets p
        WHERE p.status = 'available' AND p.city ILIKE $1
    `;
    try {
        const result = await db.query(query, [city]);
        return result.rows.map(row => new Pet(row));
    } catch (error) {
        console.error("Klaida findAvailableByCity:", error.message);
        throw error;
    }

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
      new Pet(row)
  );
};

const findAvailableByShelterId = async (shelterId) => {
  const result = await db.query(
    "SELECT * FROM pets WHERE status = 'available' AND shelter_id = $1",
    [shelterId]
  );

  return result.rows.map(
    (row) =>
      new Pet(row)
  );
};

let mockReservations = [];
let nextReservationId = 1;

const createReservation = async (reservation) => {
  const pet = mockPetsFull.find((p) => p.pet_id === reservation.pet_id);
  if (!pet) throw new Error("Pet not found");
  if (pet.status !== "available") throw new Error("Pet not available");

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

const findPetById = async (id) => {
    const query = `
        SELECT p.*,
               COALESCE(
                       (SELECT json_agg(json_build_object(
                               'image_id', img.image_id,
                               'url', img.image_url,
                               'is_primary', img.is_primary
                                        ))
                        FROM pet_images img
                        WHERE img.pet_id = p.pet_id),
                       '[]') as images
        FROM pets p
        WHERE p.pet_id = $1
    `;

    try {
        const result = await db.query(query, [id]);

        // Jei nerado - grąžiname null, jei rado - supakuojame į Pet klasę
        return result.rows[0] ? new Pet(result.rows[0]) : null;
    } catch (error) {
        throw new Error(`[petRepository.findPetById] ${error.message}`);
    }
};

module.exports = {
  findAvailableByCity,
  getAllAvailablePets,
  findAvailableByShelterId,
  createReservation,
  cancelReservation,
  getReservationById,
  findPetById
};
