const db = require("../../../Infrastructure/db");

const NOW_VILNIUS_SQL = "(NOW() AT TIME ZONE 'Europe/Vilnius')";

const getPetById = async (petId) => {
  const result = await db.query("SELECT * FROM pets WHERE pet_id = $1", [
    petId,
  ]);
  return result.rows[0] || null;
};

const getUserById = async (userId) => {
  const result = await db.query("SELECT * FROM users WHERE user_id = $1", [
    userId,
  ]);
  return result.rows[0] || null;
};

const getReservedSlots = async (petId, date) => {
  const result = await db.query(
    "SELECT reservation_start, reservation_end FROM reservations WHERE pet_id = $1 AND date = $2 AND status IN ('pending','confirmed')",
    [petId, date],
  );

  return result.rows;
};

const getCurrentDateTime = async () => {
  const result = await db.query(
    `SELECT to_char(${NOW_VILNIUS_SQL}, 'YYYY-MM-DD') AS date,
            to_char(${NOW_VILNIUS_SQL}, 'HH24:MI:SS') AS time`,
  );
  return result.rows[0];
};

const createReservation = async (reservationData) => {
  const { user_id, pet_id, date, reservation_start, reservation_end } =
    reservationData;
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Serialize reservation attempts for this pet before checking for overlap.
    await client.query("SELECT pet_id FROM pets WHERE pet_id = $1 FOR UPDATE", [
      pet_id,
    ]);

    const conflict = await client.query(
      `SELECT 1 FROM reservations
       WHERE pet_id = $1
         AND date = $2
         AND status IN ('pending','confirmed')
         AND NOT (reservation_end <= $3 OR reservation_start >= $4)
       LIMIT 1`,
      [pet_id, date, reservation_start, reservation_end],
    );
    if (conflict.rows.length > 0) {
      const error = new Error("Time slot already taken");
      error.status = 409;
      throw error;
    }

    const hasStarted = await client.query(
      `SELECT 1
       WHERE ($1::date + $2::time) <= ${NOW_VILNIUS_SQL}`,
      [date, reservation_start],
    );
    if (hasStarted.rows.length > 0) {
      const error = new Error("Selected time has already passed");
      error.status = 400;
      throw error;
    }

    const result = await client.query(
      `INSERT INTO reservations (user_id, pet_id, date, reservation_start, reservation_end, status)
       VALUES ($1, $2, $3, $4, $5, 'confirmed')
       RETURNING *`,
      [user_id, pet_id, date, reservation_start, reservation_end],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const isTimeSlotTaken = async (
  petId,
  date,
  reservationStart,
  reservationEnd,
) => {
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
            to_char(r.date, 'YYYY-MM-DD') AS date,
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

// US-15: rezervacija su gyvūno prieglauda ir požymiu, ar pasivaikščiojimas jau prasidėjo
const getReservationForCancellation = async (reservationId) => {
  const result = await db.query(
    `SELECT r.reservation_id, r.user_id, r.pet_id, r.status,
            to_char(r.date, 'YYYY-MM-DD') AS date, r.reservation_start, r.reservation_end,
            p.name AS pet_name, p.shelter_id,
            (r.date + r.reservation_start) <= ${NOW_VILNIUS_SQL} AS has_started
     FROM reservations r
     JOIN pets p ON p.pet_id = r.pet_id
     WHERE r.reservation_id = $1`,
    [reservationId],
  );
  return result.rows[0] || null;
};

// US-15: atšaukia rezervaciją ir, jei nebėra kitų aktyvių rezervacijų, grąžina gyvūną į 'available'
const cancelReservation = async (reservationId) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE reservations
       SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
       WHERE reservation_id = $1 AND status IN ('pending', 'confirmed')
       RETURNING reservation_id, user_id, pet_id, status, cancelled_at,
                 to_char(date, 'YYYY-MM-DD') AS date, reservation_start, reservation_end`,
      [reservationId],
    );

    const cancelled = result.rows[0];
    if (!cancelled) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `UPDATE pets
       SET status = 'available', updated_at = CURRENT_TIMESTAMP
       WHERE pet_id = $1
         AND status = 'reserved'
         AND NOT EXISTS (
           SELECT 1 FROM reservations
           WHERE pet_id = $1
             AND status IN ('pending', 'confirmed')
             AND (date + reservation_end) > ${NOW_VILNIUS_SQL}
         )`,
      [cancelled.pet_id],
    );

    await client.query("COMMIT");
    return cancelled;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// US-15: visos prieglaudos gyvūnų rezervacijos
const getReservationsByShelterId = async (shelterId) => {
  const result = await db.query(
    `SELECT r.reservation_id, r.user_id, r.pet_id, r.status, r.cancelled_at,
            to_char(r.date, 'YYYY-MM-DD') AS date, r.reservation_start, r.reservation_end,
            u.name AS user_name, u.surname AS user_surname,
            p.name AS pet_name,
            (r.date + r.reservation_start) > ${NOW_VILNIUS_SQL} AS is_upcoming,
            (r.date + r.reservation_end) <= ${NOW_VILNIUS_SQL} AS has_ended
     FROM reservations r
     JOIN pets p ON p.pet_id = r.pet_id
     JOIN users u ON u.user_id = r.user_id
     WHERE p.shelter_id = $1
     ORDER BY r.date DESC, r.reservation_start DESC`,
    [shelterId],
  );
  return result.rows;
};

module.exports = {
  getPetById,
  getUserById,
  getReservedSlots,
  getCurrentDateTime,
  createReservation,
  isTimeSlotTaken,
  getReservationsByUserId,
  getReservationForCancellation,
  cancelReservation,
  getReservationsByShelterId,
};
