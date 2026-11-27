// US-10: atsiliepimo apie gyvūną po pavedžiojimo taisyklės (be priklausomybių nuo DB / HTTP).

const FEEDBACK_MIN_LENGTH = 1;
const FEEDBACK_MAX_LENGTH = 3000;

// Simboliai skaičiuojami pagal Unicode kodo taškus, o ne UTF-16 vienetus,
// kad vienas emoji ar lietuviška raidė visada būtų vienas simbolis.
const countCharacters = (text) => Array.from(text).length;

const normalizeContent = (content) =>
  typeof content === "string" ? content.trim() : "";

// Grąžina klaidos tekstą arba null, jei atsiliepimo tekstas tinkamas.
const validateContent = (content) => {
  if (typeof content !== "string") {
    return "Atsiliepimas turi būti tekstas.";
  }

  const length = countCharacters(content.trim());
  if (length < FEEDBACK_MIN_LENGTH) {
    return "Atsiliepimas negali būti tuščias.";
  }
  if (length > FEEDBACK_MAX_LENGTH) {
    return `Atsiliepimas negali būti ilgesnis nei ${FEEDBACK_MAX_LENGTH} simbolių.`;
  }
  return null;
};

// JSON objektas, kuris perduodamas DI paslaugų sluoksniui (tekstas DB nesaugomas).
const buildFeedbackPayload = (reservation, content) => ({
  reservation_id: reservation.reservation_id,
  pet_id: reservation.pet_id,
  user_id: reservation.user_id,
  content,
});

module.exports = {
  FEEDBACK_MIN_LENGTH,
  FEEDBACK_MAX_LENGTH,
  countCharacters,
  normalizeContent,
  validateContent,
  buildFeedbackPayload,
};