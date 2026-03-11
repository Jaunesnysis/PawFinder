const express = require('express');
const router = express.Router();

const petService = require('../Application/petService');

/**
 * Maršrutas: GET /api/animals
 * Naudojimas: /api/animals?city=Vilnius
 */
router.get('/', async (req, res) => {
    try {
        const {city} = req.query;

        if(!city) {
            return res.status(400).json({
                error: "Miestas yra privalomas. Prašome nurodyti ?city=MiestoPavadinimas"
            });
        }
        const pets = await petService.getAvailablePets(city);
        res.json(pets);
    } catch (error){
        // Jei kažkas nutiktų ne taip, pranešame apie serverio klaidą
        console.error("Klaida API sluoksnyje:", error);
        res.status(500).json({ error: "Įvyko nenumatyta serverio klaida." });
    }
});

module.exports = router;