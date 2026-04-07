const express = require('express');
const router = express.Router();
const achievementService = require('../Application/achievementService');
const authorizeUser = require('../../../Infrastructure/Middleware/authMiddleware');

// Imituojame saugumo patikrą (Middleware)
/**
 * Maršrutas: GET /api/achievements/progress
 * Aprašymas: Grąžina vartotojo taškus ir informaciją apie sekančio pasiekimo progresą SAUGIAI(AC1, AC4, AC5)
 */
router.get('/progress', authorizeUser, async (req, res) => { // Pridėtas authorizeUser
    try {
        const userId = req.user.id;
        const progress = await achievementService.getAchievementProgress(userId);
        res.json(progress);

    } catch (error) {
        console.log("Serverio klaida Achievement Routes GET achievements");
        res.status(500).json({ error: "Serverio klaida." });
    }
});
/**
 * Maršrutas: POST /api/achievements/add-activity
 * Naudojimas: Siunčiamas JSON body: { "pointsToAdd": 10 }
 * Aprašymas: Prideda taškus vartotojui po veiklos ir patikrina pasiekimus (AC2, AC3)
 */
router.post('/add-activity', authorizeUser, async (req, res) => {
    try {
        const { pointsToAdd } = req.body;
        const userId = req.user.id;

        const result = await achievementService.addPoints(userId, pointsToAdd);
        res.json({ message: "Sėkmingai", data: result });
    } catch (error) {
        console.log("Serverio klaida Achievement Routes Add activity: ", error.message)
        res.status(500).json({ error: "Serverio klaida." });
    }
});

module.exports = router;



