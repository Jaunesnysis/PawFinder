const db = require("../../../Infrastructure/db");

const getPetById = async (petId) => {
  const result = await db.query("SELECT * FROM pets WHERE pet_id = $1", [petId]);
  return result.rows[0] || null;
};

const getUserById = async (userId) => {
  const result = await db.query("SELECT * FROM users WHERE user_id = $1", [userId]);
  return result.rows[0] || null;
};

const getReservedSlots = async (petId, date) => {
  const result = await db.query(
    "SELECT reservation_start, reservation_end FROM reservations WHERE pet_id = $1 AND date = $2 AND status IN ('pending','confirmed')",
    [petId, date],
  );

  return result.rows;
};

const createReservation = async (reservationData) => {
  const { user_id, pet_id, date, reservation_start, reservation_end } = reservationData;

  const result = await db.query(
    `INSERT INTO reservations (user_id, pet_id, date, reservation_start, reservation_end, status)
     VALUES ($1, $2, $3, $4, $5, 'confirmed')
     RETURNING *`,
    [user_id, pet_id, date, reservation_start, reservation_end],
  );

  // Update pet status to reserved in the pets table
  await db.query("UPDATE pets SET status = 'reserved' WHERE pet_id = $1", [pet_id]);

  return result.rows[0];
};

const isTimeSlotTaken = async (petId, date, reservationStart, reservationEnd) => {
  const result = await db.query(
    `SELECT 1 FROM reservations
     WHERE pet_id = $1
       AND date = $2
       AND status IN ('pending','confirmed')
       AND NOT (reservation_end <= $3 OR reservation_start >= $4)`,
    [petId, date, reservationStart, reservationEnd],
  );

  return result.rows.length > 0;
};

const getReservationsByUserId = async (userId) => {
  const result = await db.query(
    `SELECT r.reservation_id,
            r.user_id,
            r.pet_id,
            r.date,
            r.reservation_start,
            r.reservation_end,
            r.status,
            r.created_at,
            p.name AS pet_name,
            p.species AS pet_species,
            p.breed AS pet_breed,
            s.name AS shelter_name,
            s.shelter_id
     FROM reservations r
     JOIN pets p ON p.pet_id = r.pet_id
     JOIN shelters s ON s.shelter_id = p.shelter_id
     WHERE r.user_id = $1
     ORDER BY r.date DESC, r.reservation_start DESC`,
    [userId],
  );

  return result.rows;
};

module.exports = {
  getPetById,
  getUserById,
  getReservedSlots,
  createReservation,
  isTimeSlotTaken,
  getReservationsByUserId,
};