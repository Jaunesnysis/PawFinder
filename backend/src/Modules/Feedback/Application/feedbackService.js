const feedbackRepository = require("../Infrastructure/feedbackRepository");
const feedbackDispatcher = require("../Infrastructure/feedbackDispatcher");
const {
  validateContent,
  normalizeContent,
  buildFeedbackPayload,
} = require("../Domain/feedback");

const parseReservationId = (value) => {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const text = String(value).trim();
  if (!/^\d+$/.test(text)) return null;
  const id = Number(text);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

// AC10.1: atsiliepimą gali palikti tik rezervacijos savininkas, kai rezervacija
// neatšaukta, pavedžiojimas jau įvyko ir atsiliepimas dar nebuvo pateiktas.
const assertCanLeaveFeedback = (reservation, userId) => {
  if (String(reservation.user_id) !== String(userId)) {
    throw {
      status: 403,
      message: "Atsiliepimą gali palikti tik šią rezervaciją turėjęs savanoris.",
    };
  }
  if (reservation.status === "cancelled") {
    throw {
      status: 400,
      message: "Apie atšauktą rezervaciją atsiliepimo palikti negalima.",
    };
  }
  if (!reservation.has_ended) {
    throw {
      status: 400,
      message: "Atsiliepimą galima palikti tik po įvykusio pavedžiojimo.",
    };
  }
  if (reservation.feedback_received) {
    throw {
      status: 409,
      message: "Atsiliepimas apie šį pavedžiojimą jau pateiktas.",
    };
  }
};

// Jei persiuntimas nepavyko, požymis grąžinamas atgal, kad savanoris galėtų bandyti iš naujo.
const releaseAfterFailure = async (reservationId) => {
  try {
    await feedbackRepository.unmarkFeedbackReceived(reservationId);
  } catch (error) {
    console.error(
      `Nepavyko grąžinti feedback_received požymio (rezervacija ${reservationId}):`,
      error.message || error,
    );
  }
};

// US-10 (FR-10): atsiliepimo pateikimas po įvykusio pavedžiojimo.
// AC10.2: laisvo teksto laukas (1–3000 simbolių).
// AC10.3: atsiliepimas susiejamas su gyvūnu ir savanoriu per rezervaciją (pet_id imamas iš rezervacijos).
// Tekstas DB nesaugomas: DB pažymima tik `feedback_received`, o tekstas JSON forma perduodamas toliau.
const submitFeedback = async (userId, { reservation_id, content } = {}) => {
  if (!userId) throw { status: 401, message: "Reikia prisijungti." };

  const reservationId = parseReservationId(reservation_id);
  if (!reservationId) {
    throw { status: 400, message: "Neteisingas rezervacijos ID." };
  }

  const contentError = validateContent(content);
  if (contentError) throw { status: 400, message: contentError };

  const reservation =
    await feedbackRepository.getReservationForFeedback(reservationId);
  if (!reservation) throw { status: 404, message: "Rezervacija nerasta." };

  assertCanLeaveFeedback(reservation, userId);

  const claimed = await feedbackRepository.markFeedbackReceived(reservationId);
  // null = tuo pačiu metu jau pateiktas kitas atsiliepimas
  if (!claimed) {
    throw {
      status: 409,
      message: "Atsiliepimas apie šį pavedžiojimą jau pateiktas.",
    };
  }

  try {
    await feedbackDispatcher.dispatchFeedback(
      buildFeedbackPayload(claimed, normalizeContent(content)),
    );
  } catch (error) {
    console.error("Nepavyko perduoti atsiliepimo toliau:", error.message || error);
    await releaseAfterFailure(reservationId);
    throw {
      status: 502,
      message: "Nepavyko apdoroti atsiliepimo. Bandykite dar kartą.",
    };
  }

  return {
    reservation_id: claimed.reservation_id,
    pet_id: claimed.pet_id,
    user_id: claimed.user_id,
    received: true,
  };
};

module.exports = { submitFeedback };