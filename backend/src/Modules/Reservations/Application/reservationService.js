const reservationRepository = require("../Infrastructure/reservationRepository");
const notificationService = require("../../Notifications/Application/notificationService");

const WALK_START = 9; // 09:00
const WALK_END = 17; // 17:00

const normalizeTime = (timeStr) => {
  // accept HH:MM or HH:MM:SS
  const [h, m] = timeStr.split(":").map((x) => parseInt(x, 10));
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
};

const generateShelterSlots = (date) => {
  const slots = [];
  for (let hour = WALK_START; hour < WALK_END; hour += 1) {
    const start = `${String(hour).padStart(2, "0")}:00:00`;
    const end = `${String(hour + 1).padStart(2, "0")}:00:00`;
    slots.push({ date, reservation_start: start, reservation_end: end });
  }
  return slots;
};

const getAvailableTimeslots = async (petId, date) => {
  if (!petId) throw { status: 400, message: "PetId required" };
  if (!date) throw { status: 400, message: "Date required" };

  const pet = await reservationRepository.getPetById(petId);
  if (!pet) throw { status: 404, message: "Pet not found" };

  // fetch all standard schedule slots and remove reserved
  const shelterSlots = generateShelterSlots(date);
  const reservedSlots = await reservationRepository.getReservedSlots(petId, date);

  const reservedKeySet = new Set(
    reservedSlots.map((slot) => `${slot.reservation_start}-${slot.reservation_end}`),
  );

  return shelterSlots.filter(
    (slot) => !reservedKeySet.has(`${slot.reservation_start}-${slot.reservation_end}`),
  );
};

const REQUIRED_RESERVATION_FIELDS = ["user_id", "pet_id", "date", "reservation_start", "reservation_end"];

const assertRequiredFields = (reservation) => {
  const missing = REQUIRED_RESERVATION_FIELDS.some((field) => !reservation[field]);
  if (missing) {
    throw { status: 400, message: "user_id, pet_id, date, reservation_start and reservation_end are required" };
  }
};

const ensureUserExists = async (userId) => {
  const user = await reservationRepository.getUserById(userId);
  if (!user) throw { status: 404, message: "User not found" };
};

const getReservablePet = async (petId) => {
  const pet = await reservationRepository.getPetById(petId);
  if (!pet) throw { status: 404, message: "Pet not found" };
  if (pet.status !== "available") {
    throw { status: 400, message: "Pet status is not available" };
  }
  return pet;
};
const isSlotInSchedule = (date, start, end) =>
  generateShelterSlots(date).some(
    (slot) => slot.reservation_start === start && slot.reservation_end === end,
  );

const validateSlot = (date, reservationStart, reservationEnd) => {
  const normalizedStart = normalizeTime(reservationStart);
  const normalizedEnd = normalizeTime(reservationEnd);

  if (normalizedStart >= normalizedEnd) {
    throw { status: 400, message: "Invalid reservation interval" };
  }
  if (!isSlotInSchedule(date, normalizedStart, normalizedEnd)) {
    throw { status: 400, message: "Selected slot is outside shelter schedule" };
  }
  return { normalizedStart, normalizedEnd };
};

const ensureSlotIsFree = async (petId, date, start, end) => {
  const alreadyTaken = await reservationRepository.isTimeSlotTaken(petId, date, start, end);
  if (alreadyTaken) {
    throw { status: 409, message: "Time slot already taken" };
  }
};
const createReservation = async (reservation) => {
  assertRequiredFields(reservation);
  const { user_id, pet_id, date, reservation_start, reservation_end } = reservation;

  await ensureUserExists(user_id);
  const pet = await getReservablePet(pet_id);

  const { normalizedStart, normalizedEnd } = validateSlot(date, reservation_start, reservation_end);
  await ensureSlotIsFree(pet_id, date, normalizedStart, normalizedEnd);

  const created = await reservationRepository.createReservation({
    user_id,
    pet_id,
    date,
    reservation_start: normalizedStart,
    reservation_end: normalizedEnd,
  });

  await notificationService.createReservationNotification(
    pet.shelter_id,
    created.reservation_id,
    pet.name,
    date,
    normalizedStart,
    normalizedEnd,
  );

  return created;
};

module.exports = {
  getAvailableTimeslots,
  createReservation,
};