const express = require('express');
const router = express.Router();
const achievementService = require('../Application/achievementService');

// Imituojame saugumo patikrą (Middleware)
const authorizeUser = (req, res, next) => {
    // TIKRAME PROJEKTE: Čia paimtume ID iš JWT Tokeno arba Sesijos
    // ŠIUO METU: Imituojame, kad prisijungęs vartotojas yra DeivM (ID: 1)
    const loggedInUserId = 1;

    // Pridedame prisijungusio vartotojo ID prie užklausos objekto
    req.user = { id: loggedInUserId };
    next();
    //return res.status(401).json({ error: "Reikalinga autorizacija" });
};
/**
 * Maršrutas: GET /api/achievements/progress
 * Naudojimas: /api/achievements/progress?userId=1
 * Aprašymas: Grąžina vartotojo taškus ir informaciją apie sekančio pasiekimo progresą SAUGIAI(AC1, AC4, AC5)
 */
router.get('/progress', authorizeUser, async (req, res) => { // Pridėtas authorizeUser
    try {
        const { userId } = req.query;
        // 1. Logas pačioje pradžioje patikrinti ar užklausa išvis ateina
        console.log("Gauta užklausa! Query duomenys:", req.query);
        console.log("Prisijungęs vartotojas (iš req.user):", req.user);
        // AC5: Tikriname, ar prašomas ID sutampa su prisijungusio vartotojo ID
        if (parseInt(userId) !== req.user.id) {
            console.log("403");
            return res.status(403).json({
                error: "Prieiga uždrausta. Galite matyti tik savo pasiekimus."
            });
        }

        const progress = await achievementService.getAchievementProgress(userId);
        res.json(progress);
    } catch (error) {
        res.status(500).json({ error: "Serverio klaida." });
    }
});
/**
 * Maršrutas: POST /api/achievements/add-activity
 * Naudojimas: Siunčiamas JSON body: { "userId": 1, "pointsToAdd": 10 }
 * Aprašymas: Prideda taškus vartotojui po veiklos ir patikrina pasiekimus (AC2, AC3)
 */
router.post('/add-activity', authorizeUser, async (req, res) => {
    try {
        const { userId, pointsToAdd } = req.body;

        // AC5: Neleidžiame pridėti taškų, jei siuntėjas nėra tas pats vartotojas
        if (parseInt(userId) !== req.user.id) {
            return res.status(403).json({ error: "Negalite pridėti taškų kitam vartotojui." });
        }

        const result = await achievementService.addPoints(userId, pointsToAdd);
        res.json({ message: "Sėkmingai", data: result });
    } catch (error) {
        res.status(500).json({ error: "Serverio klaida." });
    }
});

module.exports = router;



