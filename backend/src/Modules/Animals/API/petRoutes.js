const express = require('express');
const router = express.Router();

const petService = require('../Application/petService');


// Front-ende tu kvieti: http://localhost:5050/api/mainAnimals
router.get('/mainAnimals', async (req, res) => {
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
            weightMax: req.query.weightMax
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

// Šitas maršrutas imituoja AC1.2 - statuso pasikeitimą realiu laiku
router.post('/broadcast-status', (req, res) => {
    // Pasiimame 'io' objektą, kurį užsetinom server.js faile
    const io = req.app.get('io');

    // Transliuojame įvykį "StatusChanged" (kaip nurodyta Subtask 2)
    // Šią žinutę gaus visi prisijungę React vartotojai
    io.emit('StatusChanged', {
        message: 'Gyvūno statusas pasikeitė!',
        updateAt: new Date()
    });

    res.json({ success: true, message: 'Real-time pranešimas išsiųstas' });
});

module.exports = router;