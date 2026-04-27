const petRepository = require("../Infrastructure/petRepository");
const notificationService = require("../../Notifications/Application/notificationService");
const reservationService = require("../../Reservations/Application/reservationService");

/**
 * Funkcija skirta gauti laisvus augintiniuas pasirinktame mieste
 */
const getAvailablePets = async (city) => {
  return await petRepository.findAvailableByCity(city);
};

const getAllAvailablePets = async (filters = {}) => {
  return await petRepository.getAllAvailablePets(filters);
};

const createReservation = async (reservationData) => {
  return await reservationService.createReservation(reservationData);
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

const getPetById = async (id) => {
  // Čia ateityje galėtum tikrinti teises arba transformuoti duomenis
  const pet = await petRepository.findPetById(id);

  if (!pet) {
    throw new Error("Apgailestaujame, šis gyvūnas nerastas.");
  }

  return pet;
};

const getDistinctBreeds = async (species) => {
  return await petRepository.getDistinctBreeds(species);
};

const addFavorite = async (userId, petId) => {
  const userIdNum = parseInt(userId, 10);
  const petIdNum = parseInt(petId, 10);

  if (isNaN(userIdNum) || isNaN(petIdNum)) {
    throw new Error("Neteisingi ID.");
  }

  // Optional: patikrinti ar gyvūnas egzistuoja
  const pet = await petRepository.findPetById(petIdNum);
  if (!pet) {
    throw new Error("Gyvūnas nerastas.");
  }

  return await petRepository.addFavorite(userIdNum, petIdNum);
};

const removeFavorite = async (userId, petId) => {
  const userIdNum = parseInt(userId, 10);
  const petIdNum = parseInt(petId, 10);

  if (isNaN(userIdNum) || isNaN(petIdNum)) {
    throw new Error("Neteisingi ID.");
  }

  return await petRepository.removeFavorite(userIdNum, petIdNum);
};

const getFavoritesByUserId = async (userId) => {
  const userIdNum = parseInt(userId, 10);

  if (isNaN(userIdNum)) {
    throw new Error("Neteisingas user ID.");
  }

  return await petRepository.getFavoritesByUser(userIdNum);
};

const isFavorite = async (userId, petId) => {
  return await petRepository.isFavorite(userId, petId);
};

module.exports = {
  getAvailablePets,
  getAllAvailablePets,
  createReservation,
  cancelReservation,
  getPetById,
  getDistinctBreeds,
  addFavorite,
  removeFavorite,
  getFavoritesByUserId,
  isFavorite,
};
