const petRepository = require("../Infrastructure/petRepository");
const notificationService = require("../../Notifications/Application/notificationService");

/**
 * Funkcija skirta gauti laisvus augintiniuas pasirinktame mieste
 */
const getAvailablePets = async (city) => {
  // Mes tiesiog paprašome repository, kad jis mums surastų duomenis.
  // Ateityje čia galėtume pridėti papildomų tikrinimų.
  return await petRepository.findAvailableByCity(city);
};

const getAllAvailablePets = async (filters = {}) => {
  return await petRepository.getAllAvailablePets(filters);
};

const createReservation = async (reservationData) => {
  const reservation = await petRepository.createReservation(reservationData);

  // Get pet details
  const pet = await petRepository
    .getAllAvailablePets()
    .then((pets) => pets.find((p) => p.pet_id === reservation.pet_id));

  // Create notification
  await notificationService.createReservationNotification(
    pet.shelter_id,
    reservation.reservation_id,
    pet.name,
    reservation.date,
    reservation.reservation_start,
    reservation.reservation_end,
  );

  return reservation;
};

const cancelReservation = async (reservationId) => {
  const reservation = await petRepository.cancelReservation(reservationId);

  // Get pet details
  const pet = await petRepository
    .getAllAvailablePets()
    .then((pets) => pets.find((p) => p.pet_id === reservation.pet_id));

  // Create cancellation notification
  await notificationService.createCancellationNotification(
    pet.shelter_id,
    reservation.reservation_id,
    pet.name,
    reservation.date,
    reservation.reservation_start,
    reservation.reservation_end,
  );

  return reservation;
};

module.exports = {
  getAvailablePets,
  getAllAvailablePets,
  createReservation,
  cancelReservation,
};
