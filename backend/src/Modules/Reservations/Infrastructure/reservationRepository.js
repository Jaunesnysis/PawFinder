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

const getReservationDetails = async (reservationId) => {
  const result = await db.query(
    `SELECT r.*, p.name as pet_name, p.shelter_id, u.name as user_name
     FROM reservations r
     JOIN pets p ON r.pet_id = p.pet_id
     JOIN users u ON r.user_id = u.user_id
     WHERE r.reservation_id = $1`,
    [reservationId],
  );

  return result.rows[0] || null;
};

const cancelReservation = async (reservationId) => {
  const result = await db.query(
    `UPDATE reservations 
     SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP 
     WHERE reservation_id = $1 
     RETURNING *`,
    [reservationId],
  );

  if (result.rows[0]) {
    // Update pet status back to available
    const reservation = result.rows[0];
    await db.query("UPDATE pets SET status = 'available' WHERE pet_id = $1", [
      reservation.pet_id,
    ]);
  }

  return result.rows[0] || null;
};

module.exports = {
  getPetById,
  getUserById,
  getReservedSlots,
  createReservation,
  isTimeSlotTaken,
  getReservationDetails,
  cancelReservation,
};