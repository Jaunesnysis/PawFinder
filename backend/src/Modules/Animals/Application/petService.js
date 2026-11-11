const petRepository = require("../Infrastructure/petRepository");
const notificationService = require("../../Notifications/Application/notificationService");
const reservationService = require("../../Reservations/Application/reservationService");

const { Pet } = require('../Domain/Pet');
const userService = require('../../Users/Application/userService'); // pritaikykite kelią

const httpError = (status, message) => Object.assign(new Error(message), { status });
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

const getSheltersPets = async (userId)=> {
  return await petRepository.findSheltersPets(userId);
};

const requireShelterId = async (userId) => {
    const shelterId = await userService.getShelterIdByUserId(userId);
    if (!shelterId) throw httpError(403, "Tik prieglaudos darbuotojai gali valdyti gyvūnus.");
    return shelterId;
};

const buildValidPet = (raw, isEdit) => {
    const pet = Pet.fromInput(raw, isEdit);
    const errors = pet.validate();
    if (errors.length > 0) throw httpError(400, errors.join('; '));
    return pet;
};

const createPet = async (userId, raw) => {
    const shelterId = await requireShelterId(userId);
    const pet = buildValidPet(raw, false);
    const petId = await petRepository.createPet({ ...pet, shelter_id: shelterId });
    return petRepository.findPetById(petId);
};

const updatePet = async (userId, petId, raw) => {
    await assertOwnsPet(userId, petId);
    const pet = buildValidPet(raw, true);
    await petRepository.updatePet(petId, pet);
    return petRepository.findPetById(petId);
};

const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../../../../uploads');   // backend/uploads

const assertOwnsPet = async (userId, petId) => {
    const shelterId = await requireShelterId(userId);
    const petShelterId = await petRepository.findPetShelterId(petId);
    if (petShelterId == null) throw httpError(404, 'Gyvūnas nerastas.');
    if (String(petShelterId) !== String(shelterId))
        throw httpError(403, 'Šis gyvūnas nepriklauso jūsų prieglaudai.');
};

const addImages = async (userId, petId, files, primaryIndex) => {
    await assertOwnsPet(userId, petId);
    if (!files || files.length === 0)
        throw httpError(400, 'Pasirinkite bent vieną JPG arba PNG failą.');

    const urls = files.map((f) => `/uploads/${f.filename}`);
    const idx = primaryIndex === undefined || primaryIndex === '' ? null : Number(primaryIndex);
    await petRepository.addPetImages(petId, urls, idx);
    return petRepository.findPetById(petId);
};

const deleteImage = async (userId, petId, imageId) => {
    await assertOwnsPet(userId, petId);
    const img = await petRepository.findPetImage(petId, imageId);
    if (!img) throw httpError(404, 'Nuotrauka nerasta.');

    await petRepository.deletePetImage(petId, imageId);
    if (img.image_url.startsWith('/uploads/'))      // trinam failą tik jei jis mūsų
        fs.unlink(path.join(UPLOADS_DIR, path.basename(img.image_url)), () => {});
    return petRepository.findPetById(petId);
};

const setPrimaryImage = async (userId, petId, imageId) => {
    await assertOwnsPet(userId, petId);
    const img = await petRepository.findPetImage(petId, imageId);
    if (!img) throw httpError(404, 'Nuotrauka nerasta.');
    await petRepository.setPrimaryImage(petId, imageId);
    return petRepository.findPetById(petId);
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
  getSheltersPets,
  createPet,
  updatePet,
  addImages,
  deleteImage,
  setPrimaryImage,
  UPLOADS_DIR,
};
