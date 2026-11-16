const express = require("express");
const router = express.Router();
const reservationService = require("../Application/reservationService");
const authorizeUser = require("../../../Infrastructure/Middleware/authMiddleware");

const sendError = (res, error, label) => {
  console.error(`${label}:`, error.message || error);
  res
    .status(error.status || 500)
    .json({ error: error.status ? error.message : "Internal server error" });
};

router.get("/pets/:id/timeslots", async (req, res) => {
  try {
    const petId = parseInt(req.params.id, 10);
    const date = req.query.date || new Date().toISOString().split("T")[0];

    const slots = await reservationService.getAvailableTimeslots(petId, date);
    res.json({ pet_id: petId, date, slots });
  } catch (error) {
    console.error("Reservation timeslot error:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal server error" });
  }
});

router.post("/", authorizeUser, async (req, res) => {
  try {
    const bodyData = req.body;
    const securePayload = {
      ...bodyData,
      user_id: req.user.id,
    };
    const reservation =
      await reservationService.createReservation(securePayload);
    res
      .status(201)
      .json({ message: "Reservation successfully created.", reservation });
  } catch (error) {
    console.error("Reservation creation error:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal server error" });
  }
});

router.get("/me", authorizeUser, async (req, res) => {
  try {
    const reservations = await reservationService.getUserReservations(
      req.user.id,
    );
    res.json(reservations);
  } catch (error) {
    console.error("Get my reservations error:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal server error" });
  }
});

// US-15: GET /api/reservations/shelter – prisijungusio prieglaudos darbuotojo prieglaudos rezervacijos
router.get("/shelter", authorizeUser, async (req, res) => {
  try {
    const reservations = await reservationService.getShelterReservations(
      req.user.id,
    );
    res.json({ reservations });
  } catch (error) {
    sendError(res, error, "Get shelter reservations error");
  }
});

// US-15: POST /api/reservations/:id/cancel – atšaukia savanoris (savo) arba prieglauda (savo gyvūno)
router.post("/:id/cancel", authorizeUser, async (req, res) => {
  try {
    const reservation = await reservationService.cancelReservation(
      req.user.id,
      req.params.id,
    );
    res.json({ message: "Rezervacija atšaukta.", reservation });
  } catch (error) {
    sendError(res, error, "Reservation cancellation error");
  }
});

module.exports = router;
