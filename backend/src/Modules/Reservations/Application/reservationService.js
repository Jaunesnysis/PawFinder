const reservationRepository = require("../Infrastructure/reservationRepository");
const notificationService = require("../../Notifications/Application/notificationService");

const WALK_START = 9; // 09:00
const WALK_END = 17; // 17:00
const SLOT_MINUTES = 60;

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

const createReservation = async (reservation) => {
  const { user_id, pet_id, date, reservation_start, reservation_end } = reservation;

  if (!user_id || !pet_id || !date || !reservation_start || !reservation_end) {
    throw { status: 400, message: "user_id, pet_id, date, reservation_start and reservation_end are required" };
  }

  const user = await reservationRepository.getUserById(user_id);
  if (!user) throw { status: 404, message: "User not found" };

  const pet = await reservationRepository.getPetById(pet_id);
  if (!pet) throw { status: 404, message: "Pet not found" };
  if (pet.status === "adopted") {
    throw { status: 400, message: "Pet is already adopted" };
  }

  const normalizedStart = normalizeTime(reservation_start);
  const normalizedEnd = normalizeTime(reservation_end);

  if (normalizedStart >= normalizedEnd) {
    throw { status: 400, message: "Invalid reservation interval" };
  }

  const allSlots = generateShelterSlots(date);
  const slotValid = allSlots.some(
    (s) => s.reservation_start === normalizedStart && s.reservation_end === normalizedEnd,
  );
  if (!slotValid) {
    throw { status: 400, message: "Selected slot is outside shelter schedule" };
  }

  const alreadyTaken = await reservationRepository.isTimeSlotTaken(
    pet_id,
    date,
    normalizedStart,
    normalizedEnd,
  );

  if (alreadyTaken) {
    throw { status: 409, message: "Time slot already taken" };
  }

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

const cancelReservation = async (reservationId) => {
  // Get reservation details to extract pet_id for pet info
  const reservation = await reservationRepository.getReservationById(reservationId);
  if (!reservation) {
    throw { status: 404, message: "Reservation not found" };
  }

  // Get pet details for notification
  const pet = await reservationRepository.getPetById(reservation.pet_id);
  if (!pet) {
    throw { status: 404, message: "Pet not found" };
  }

  // Cancel the reservation
  const cancelled = await reservationRepository.cancelReservation(reservationId);

  // Create cancellation notification
  await notificationService.createCancellationNotification(
    pet.shelter_id,
    reservation.reservation_id,
    pet.name,
    reservation.date,
    reservation.reservation_start,
    reservation.reservation_end,
  );

  return cancelled;
};

const getUserReservations = async (userId) => {
  if (!userId) {
    throw { status: 400, message: "User ID required" };
  }
  
  const reservations = await reservationRepository.getUserReservations(userId);
  return reservations;
};

const getShelterReservations = async (shelterId) => {
  if (!shelterId) {
    throw { status: 400, message: "Shelter ID required" };
  }
  
  const reservations = await reservationRepository.getShelterReservations(shelterId);
  return reservations;
};

module.exports = {
  getAvailableTimeslots,
  createReservation,
  cancelReservation,
  getUserReservations,
  getShelterReservations,
};