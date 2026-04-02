const express = require('express');
const router = express.Router();
const userService = require('../Application/userService');

/**
 * Maršrutas: POST /api/users/login
 * Aprašymas: Vartotojo prisijungimas
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "El. paštas ir slaptažodis yra privalomi." });
        }

        const result = await userService.login(email, password);

        // Jei viskas gerai, siunčiame tokeną ir vartotojo info
        res.json(result);

    } catch (error) {
        console.error("Login klaida:", error.message);
        res.status(401).json({ error: error.message });
    }
});

module.exports = router;