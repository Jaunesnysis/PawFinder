const express = require('express');
const router = express.Router();

const shelterService = require('../Application/shelterService');
const { Shelter } = require('../Domain/Shelter');

// POST /api/shelters/register (naujas: validacija + Shelter klasė + id atsakyme)
router.post('/register', async (req, res) => {
    try {
        const shelter = new Shelter(req.body);
        const errors = shelter.validate();

        if (errors.length > 0) {
            return res.status(400).json({ error: errors.join(', ') });
        }

        const result = await shelterService.registerShelter(shelter);
        res.status(201).json(result);
    } catch (error) {
        console.error('Shelter registration error:', error);

        if (error.code === '23505') {
            return res.status(409).json({ error: 'Shelter with this data already exists' });
        }

        res.status(500).json({ error: 'Unable to register shelter' });
    }
});

// GET /api/shelters
// Returns a list of all shelters
router.get('/', async (req, res) => {
    try {
        const shelters = await shelterService.getAllShelters();
        res.json(shelters);
    } catch (error) {
        console.error('Shelters list error:', error);
        res.status(500).json({ error: 'Unable to load shelters list' });
    }
});

// GET /api/shelters/:shelterId
// Returns shelter profile and active pets for the shelter.
router.get('/:shelterId', async (req, res) => {
    try {
        const { shelterId } = req.params;
        const profile = await shelterService.getShelterProfile(shelterId);

        if (!profile) {
            return res.status(404).json({ error: 'Shelter not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Shelter profile error:', error);
        res.status(500).json({ error: 'Unable to load shelter profile' });
    }
});

module.exports = router;
