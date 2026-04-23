const express = require("express");
const router = express.Router();

const petService = require("../Application/petService");
const reservationService = require("../../Reservations/Application/reservationService");

// Front-ende tu kvieti: http://localhost:5050/api/mainAnimals
router.get("/mainAnimals", async (req, res) => {
  try {
    const filters = {
      species: req.query.species,
      breed: req.query.breed,
      size: req.query.size,
      activity: req.query.activity,
      city: req.query.city,
      ageMin: req.query.ageMin,
      ageMax: req.query.ageMax,
      weightMin: req.query.weightMin,
      weightMax: req.query.weightMax,
    };

    // Gauname filtruotus duomenis tiesiai iš repository lygmens
    const pets = await petService.getAllAvailablePets(filters);

    res.json(pets);
  } catch (error) {
    console.error("Klaida mainAnimals API:", error);
    res.status(500).json({ error: "Nepavyko užkrauti pagrindinio sąrašo." });
  }
});

/**
 * Maršrutas: GET /api/animals
 * Naudojimas: /api/animals?city=Vilnius
 */
router.get("/", async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        error:
          "Miestas yra privalomas. Prašome nurodyti ?city=MiestoPavadinimas",
      });
    }
    const pets = await petService.getAvailablePets(city);
    res.json(pets);
  } catch (error) {
    // Jei kažkas nutiktų ne taip, pranešame apie serverio klaidą
    console.error("Klaida API sluoksnyje:", error);
    res.status(500).json({ error: "Įvyko nenumatyta serverio klaida." });
  }
});

//get all distinct breeds for a given species
router.get("/breeds", async (req, res) => {
  const { species } = req.query;
  const breeds = await petService.getDistinctBreeds(species);
  res.json(breeds);
});

/**
 * Maršrutas: GET /api/pets/:id
 * Naudojimas: /api/pets/5
 * Parametras: id (Path parameter)
 */
router.get("/:id", async (req, res) => {
  try {
    // req.params.id paima skaičių tiesiai iš URL adreso
    const petId = req.params.id;

    const pet = await petService.getPetById(petId);
    res.json(pet);
  } catch (error) {
    console.error("Klaida gaunant gyvūno detales:", error.message);

    // Jei klaida "nerastas", grąžiname 404, kitu atveju 500
    if (error.message.includes("nerastas")) {
      return res.status(404).json({ error: error.message });
    }
    res
      .status(500)
      .json({ error: "Sistemos klaida bandant gauti gyvūno duomenis." });
  }
});

// Šitas maršrutas imituoja AC1.2 - statuso pasikeitimą realiu laiku
router.post("/broadcast-status", (req, res) => {
  // Pasiimame 'io' objektą, kurį užsetinom server.js faile
  const io = req.app.get("io");

  // Transliuojame įvykį "StatusChanged" (kaip nurodyta Subtask 2)
  // Šią žinutę gaus visi prisijungę React vartotojai
  io.emit("StatusChanged", {
    message: "Gyvūno statusas pasikeitė!",
    updateAt: new Date(),
  });

  res.json({ success: true, message: "Real-time pranešimas išsiųstas" });
});

/**
 * POST /api/pets/reservations
 * Create a new reservation
 */
router.get("/:id/timeslots", async (req, res) => {
  try {
    const petId = parseInt(req.params.id, 10);
    const date = req.query.date || new Date().toISOString().split("T")[0];

    const slots = await reservationService.getAvailableTimeslots(petId, date);
    res.json({ pet_id: petId, date, slots });
  } catch (error) {
    console.error("Klaida gaunant laisvus slotus:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Nepavyko gauti laisvų slotų." });
  }
});

router.post("/reservations", async (req, res) => {
  try {
    const { user_id, pet_id, date, reservation_start, reservation_end } =
      req.body;

    if (
      !user_id ||
      !pet_id ||
      !date ||
      !reservation_start ||
      !reservation_end
    ) {
      return res.status(400).json({ error: "Trūksta duomenų." });
    }

    const reservation = await petService.createReservation({
      user_id: parseInt(user_id),
      pet_id: parseInt(pet_id),
      date,
      reservation_start,
      reservation_end,
    });

    res
      .status(201)
      .json({ message: "Reservation successfully created.", reservation });
  } catch (error) {
    console.error("Klaida kuriant rezervaciją:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Nepavyko sukurti rezervacijos." });
  }
});

/**
 * POST /api/pets/reservations/:id/cancel
 * Cancel a reservation
 */
router.post("/reservations/:id/cancel", async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id);

    const reservation = await petService.cancelReservation(reservationId);

    res.json(reservation);
  } catch (error) {
    console.error("Klaida atšaukiant rezervaciją:", error);
    res
      .status(500)
      .json({ error: error.message || "Nepavyko atšaukti rezervacijos." });
  }
});

module.exports = router;
