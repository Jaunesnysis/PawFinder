const express = require("express");
const router = express.Router();
const lifestyleService = require("../Application/lifestyleService");
const authorizeUser = require("../../../Infrastructure/Middleware/authMiddleware");

const sendError = (res, error) =>
  res
    .status(error.status || 500)
    .json({ error: error.status ? error.message : "Internal server error" });

// GET /api/lifestyle/me
// Grąžina { lifestyle: { description, tags } }
router.get("/me", authorizeUser, async (req, res) => {
  try {
    const lifestyle = await lifestyleService.getLifestyle(req.user);
    res.json({ lifestyle });
  } catch (error) {
    console.error("Lifestyle get error:", error);
    sendError(res, error);
  }
});

// PUT /api/lifestyle/me
// Body: { description: string, consent: boolean }
router.put("/me", authorizeUser, async (req, res) => {
  try {
    const { description, consent } = req.body || {};
    const lifestyle = await lifestyleService.saveLifestyle(req.user, {
      description,
      consent,
    });
    res.json({ message: "Gyvenimo būdo aprašymas išsaugotas.", lifestyle });
  } catch (error) {
    console.error("Lifestyle save error:", error);
    sendError(res, error);
  }
});

// GET /api/lifestyle/me/suggestions
// Laisvi gyvūnai su bendrais tagais, daugiausia sutapimų pirmi
router.get("/me/suggestions", authorizeUser, async (req, res) => {
  try {
    const pets = await lifestyleService.getSuggestedPets(req.user);
    res.json(pets);
  } catch (error) {
    console.error("Lifestyle suggestions error:", error);
    sendError(res, error);
  }
});

module.exports = router;
