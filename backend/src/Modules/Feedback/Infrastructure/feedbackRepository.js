const db = require("../../../Infrastructure/db");

const NOW_VILNIUS_SQL = "(NOW() AT TIME ZONE 'Europe/Vilnius')";

// US-10: rezervacija su požymiais, reikalingais atsiliepimo teisėms patikrinti.
// Gyvūnas nustatomas pagal rezervaciją (pet_id), o ne pagal kliento užklausą.
const getReservationForFeedback = async (reservationId) => {
  const result = await db.query(
    `SELECT r.reservation_id, r.user_id, r.pet_id, r.status, r.feedback_received,
            (r.date + r.reservation_end) <= ${NOW_VILNIUS_SQL} AS has_ended
     FROM reservations r
     WHERE r.reservation_id = $1`,
    [reservationId],
  );
  return result.rows[0] || null;
};

// Atominis žingsnis: požymis nustatomas tik jei atsiliepimas dar negautas, rezervacija
// neatšaukta ir pavedžiojimas jau pasibaigęs. null = sąlygos nebetenkinamos
// (pvz., kitas identiškas pateikimas spėjo anksčiau).
const markFeedbackReceived = async (reservationId) => {
  const result = await db.query(
    `UPDATE reservations
     SET feedback_received = TRUE
     WHERE reservation_id = $1
       AND feedback_received = FALSE
       AND status <> 'cancelled'
       AND (date + reservation_end) <= ${NOW_VILNIUS_SQL}
     RETURNING reservation_id, user_id, pet_id, feedback_received`,
    [reservationId],
  );
  return result.rows[0] || null;
};

// Grąžina požymį atgal, jei atsiliepimo nepavyko perduoti toliau (tekstas DB nesaugomas).
const unmarkFeedbackReceived = async (reservationId) => {
  await db.query(
    `UPDATE reservations
     SET feedback_received = FALSE
     WHERE reservation_id = $1`,
    [reservationId],
  );
};

module.exports = {
  getReservationForFeedback,
  markFeedbackReceived,
  unmarkFeedbackReceived,
};