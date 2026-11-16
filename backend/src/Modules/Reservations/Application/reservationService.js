const reservationRepository = require("../Infrastructure/reservationRepository");
const notificationService = require("../../Notifications/Application/notificationService");
const userService = require("../../Users/Application/userService");

const WALK_START = 9; // 09:00
const WALK_END = 17; // 17:00
const SLOT_MINUTES = 60;

const isValidDate = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return parsed.toISOString().slice(0, 10) === date;
};

const isInPast = (date, time, currentDateTime) =>
  date < currentDateTime.date ||
  (date === currentDateTime.date && time <= currentDateTime.time);

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
  if (!isValidDate(date)) {
    throw { status: 400, message: "Invalid date" };
  }

  const pet = await reservationRepository.getPetById(petId);
  if (!pet) throw { status: 404, message: "Pet not found" };
  if (pet.status !== "available") return [];

  const currentDateTime = await reservationRepository.getCurrentDateTime();
  if (date < currentDateTime.date) return [];

  // fetch all standard schedule slots and remove reserved
  const shelterSlots = generateShelterSlots(date);
  const futureSlots =
    date === currentDateTime.date
      ? shelterSlots.filter(
          (slot) => slot.reservation_start > currentDateTime.time,
        )
      : shelterSlots;
  const reservedSlots = await reservationRepository.getReservedSlots(
    petId,
    date,
  );

  const reservedKeySet = new Set(
    reservedSlots.map(
      (slot) => `${slot.reservation_start}-${slot.reservation_end}`,
    ),
  );

  return futureSlots.filter(
    (slot) =>
      !reservedKeySet.has(`${slot.reservation_start}-${slot.reservation_end}`),
  );
};

const createReservation = async (reservation) => {
  const { user_id, pet_id, date, reservation_start, reservation_end } =
    reservation;

  if (!user_id || !pet_id || !date || !reservation_start || !reservation_end) {
    throw {
      status: 400,
      message:
        "user_id, pet_id, date, reservation_start and reservation_end are required",
    };
  }
  if (!isValidDate(date)) {
    throw { status: 400, message: "Invalid reservation date" };
  }

  const user = await reservationRepository.getUserById(user_id);
  if (!user) throw { status: 404, message: "User not found" };

  const pet = await reservationRepository.getPetById(pet_id);
  if (!pet) throw { status: 404, message: "Pet not found" };
  if (pet.status !== "available") {
    throw { status: 400, message: "Pet is not available for walking" };
  }

  const normalizedStart = normalizeTime(reservation_start);
  const normalizedEnd = normalizeTime(reservation_end);

  if (normalizedStart >= normalizedEnd) {
    throw { status: 400, message: "Invalid reservation interval" };
  }

  const allSlots = generateShelterSlots(date);
  const slotValid = allSlots.some(
    (s) =>
      s.reservation_start === normalizedStart &&
      s.reservation_end === normalizedEnd,
  );
  if (!slotValid) {
    throw { status: 400, message: "Selected slot is outside shelter schedule" };
  }

  const currentDateTime = await reservationRepository.getCurrentDateTime();
  if (isInPast(date, normalizedStart, currentDateTime)) {
    throw { status: 400, message: "Cannot reserve a past date or time" };
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

  // Pranešimo klaida neturi sugadinti jau sukurtos rezervacijos
  try {
    await notificationService.createReservationNotification(
      pet.shelter_id,
      created.reservation_id,
      pet.name,
      date,
      normalizedStart,
      normalizedEnd,
    );
  } catch (error) {
    console.error("Nepavyko sukurti rezervacijos pranešimo:", error.message);
  }

  return created;
};

const getUserReservations = async (userId, now = new Date()) => {
  if (!userId) {
    throw { status: 400, message: "User id is required" };
  }

  const reservations =
    await reservationRepository.getReservationsByUserId(userId);

  const future = [];
  const past = [];

  reservations.forEach((reservation) => {
    const reservationDateTime = new Date(
      `${reservation.date}T${reservation.reservation_end}`,
    );
    const isPast = reservationDateTime < now;

    const item = {
      ...reservation,
      pet_name: reservation.pet_name || "Gyvūnas",
      shelter_name: reservation.shelter_name || "Prieglauda",
      is_past: isPast,
    };

    if (isPast) {
      past.push(item);
    } else {
      future.push(item);
    }
  });

  return {
    future: future.sort(
      (a, b) =>
        new Date(`${a.date}T${a.reservation_start}`) -
        new Date(`${b.date}T${b.reservation_start}`),
    ),
    past: past.sort(
      (a, b) =>
        new Date(`${b.date}T${b.reservation_end}`) -
        new Date(`${a.date}T${a.reservation_end}`),
    ),
  };
};

// US-15: kas atšaukia – rezervacijos savininkas ('user') ar gyvūno prieglauda ('shelter')
const getCancellationActor = async (userId, reservation) => {
  if (String(reservation.user_id) === String(userId)) return "user";

  const shelterId = await userService.getShelterIdByUserId(userId);
  if (shelterId != null && String(shelterId) === String(reservation.shelter_id))
    return "shelter";

  return null;
};

// US-15: rezervacijos atšaukimas (savanoris arba prieglauda)
const cancelReservation = async (userId, reservationId) => {
  if (!userId) throw { status: 401, message: "Reikia prisijungti." };

  const id = Number(reservationId);
  if (!Number.isInteger(id) || id <= 0) {
    throw { status: 400, message: "Neteisingas rezervacijos ID." };
  }

  const reservation =
    await reservationRepository.getReservationForCancellation(id);
  if (!reservation) throw { status: 404, message: "Rezervacija nerasta." };

  const actor = await getCancellationActor(userId, reservation);
  if (!actor) {
    throw {
      status: 403,
      message: "Neturite teisės atšaukti šios rezervacijos.",
    };
  }

  if (reservation.status === "cancelled") {
    throw { status: 409, message: "Rezervacija jau atšaukta." };
  }
  if (reservation.has_started) {
    throw {
      status: 400,
      message:
        "Prasidėjusio ar pasibaigusio pasivaikščiojimo atšaukti negalima.",
    };
  }

  const cancelled = await reservationRepository.cancelReservation(id);
  // null = kažkas atšaukė tuo pačiu metu
  if (!cancelled) throw { status: 409, message: "Rezervacija jau atšaukta." };

  if (actor === "user") {
    // Pranešimo klaida neturi sugadinti jau atlikto atšaukimo
    try {
      await notificationService.createCancellationNotification(
        reservation.shelter_id,
        reservation.reservation_id,
        reservation.pet_name,
        reservation.date,
        reservation.reservation_start,
        reservation.reservation_end,
      );
    } catch (error) {
      console.error("Nepavyko sukurti atšaukimo pranešimo:", error.message);
    }
  } else if (actor === "shelter") {
    // Prieglauda atšaukė – pranešame savanoriui
    try {
      await notificationService.createShelterCancellationNotification(
        reservation.user_id,
        reservation.reservation_id,
        reservation.pet_name,
        reservation.date,
        reservation.reservation_start,
        reservation.reservation_end,
      );
    } catch (error) {
      console.error("Nepavyko sukurti atšaukimo pranešimo savanoriui:", error.message);
    }
  }

  return { ...cancelled, cancelled_by: actor };
};

// US-15: prieglaudos rezervacijų sąrašas
const getShelterReservations = async (userId) => {
  if (!userId) throw { status: 401, message: "Reikia prisijungti." };

  const shelterId = await userService.getShelterIdByUserId(userId);
  if (!shelterId) {
    throw {
      status: 403,
      message:
        "Tik prieglaudos darbuotojai gali matyti prieglaudos rezervacijas.",
    };
  }

  const rows =
    await reservationRepository.getReservationsByShelterId(shelterId);
  return rows.map((r) => ({
    reservation_id: r.reservation_id,
    user_id: r.user_id,
    pet_id: r.pet_id,
    pet_name: r.pet_name,
    volunteer: r.user_surname
      ? `${r.user_name} ${r.user_surname.charAt(0)}.`
      : r.user_name,
    date: r.date,
    reservation_start: r.reservation_start,
    reservation_end: r.reservation_end,
    status: r.status,
    cancelled_at: r.cancelled_at,
    is_upcoming: r.is_upcoming,
    has_ended: r.has_ended,
  }));
};

module.exports = {
  getAvailableTimeslots,
  createReservation,
  getUserReservations,
  cancelReservation,
  getShelterReservations,
};
