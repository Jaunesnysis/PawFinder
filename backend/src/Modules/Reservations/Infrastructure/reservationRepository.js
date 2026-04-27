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

// Patikrina ar vartotojas jau turi aktyvią rezervaciją tam pačiam augintiniui tą pačią dieną
const getUserReservationForPetOnDate = async (userId, petId, date) => {
  const result = await db.query(
    `SELECT * FROM reservations
     WHERE user_id = $1
       AND pet_id = $2
       AND date = $3
       AND status IN ('pending','confirmed')`,
    [userId, petId, date],
  );

  return result.rows[0] || null;
};

const getReservationById = async (reservationId) => {
  const result = await db.query(
    "SELECT * FROM reservations WHERE reservation_id = $1",
    [reservationId],
  );
  return result.rows[0] || null;
};

const cancelReservation = async (reservationId) => {
  // Get reservation details first (needed for notification)
  const reservation = await getReservationById(reservationId);
  if (!reservation) {
    throw { status: 404, message: "Reservation not found" };
  }

  if (reservation.status === "cancelled") {
    throw { status: 400, message: "Reservation is already cancelled" };
  }

  // Update reservation status to cancelled
  const result = await db.query(
    "UPDATE reservations SET status = 'cancelled' WHERE reservation_id = $1 RETURNING *",
    [reservationId],
  );

  return result.rows[0];
};

const getUserReservations = async (userId) => {
  const result = await db.query(
    `SELECT r.*, p.name as pet_name, p.shelter_id
     FROM reservations r
     JOIN pets p ON r.pet_id = p.pet_id
     WHERE r.user_id = $1
     ORDER BY r.date DESC`,
    [userId],
  );
  return result.rows;
};

const getShelterReservations = async (shelterId) => {
  const result = await db.query(
    `SELECT r.*, p.name as pet_name, p.shelter_id,
            CONCAT(u.name, ' ', u.surname) as user_name, u.email as user_email
     FROM reservations r
     JOIN pets p ON r.pet_id = p.pet_id
     JOIN users u ON r.user_id = u.user_id
     WHERE p.shelter_id = $1
     ORDER BY r.date DESC`,
    [shelterId],
  );
  return result.rows;
};

module.exports = {
  getPetById,
  getUserById,
  getReservedSlots,
  createReservation,
  isTimeSlotTaken,
  getReservationById,
  cancelReservation,
  getUserReservations,
  getShelterReservations,
};