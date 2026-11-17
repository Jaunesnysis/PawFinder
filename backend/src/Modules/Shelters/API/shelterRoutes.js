const express = require('express');
const router = express.Router();

const shelterService = require('../Application/shelterService');
const { Shelter } = require('../Domain/Shelter');

const jwt = require('jsonwebtoken');
const userService = require('../../Users/Application/userService');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

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

router.put('/me', authenticateToken, async (req, res) => {
    try {
        const shelterId = await userService.getShelterIdByUserId(req.user.userId);
        if (!shelterId) {
            return res.status(403).json({ error: 'User is not linked to a shelter' });
        }

        const shelter = new Shelter(req.body);
        const errors = shelter.validate();

        if (errors.length > 0) {
            return res.status(400).json({ error: errors.join(', ') });
        }

        const updatedShelter = await shelterService.updateShelter(shelterId, shelter);
        if (!updatedShelter) {
            return res.status(404).json({ error: 'Shelter not found' });
        }

        res.json(updatedShelter);
    } catch (error) {
        console.error('Shelter update error:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Shelter with this data already exists' });
        }
        res.status(500).json({ error: 'Unable to update shelter' });
    }
});

// DELETE /api/shelters/me
router.delete('/me', authenticateToken, async (req, res) => {
    try {
        const shelterId = await userService.getShelterIdByUserId(req.user.userId);
        if (!shelterId) {
            return res.status(403).json({ error: 'User is not linked to a shelter' });
        }

        // Pirma ištrinam user (nes users.shelter_id rodo į shelters), tada patį shelter
        await userService.deleteUser(req.user.userId);
        const deletedShelter = await shelterService.deleteShelter(shelterId);

        if (!deletedShelter) {
            return res.status(404).json({ error: 'Shelter not found' });
        }

        res.sendStatus(204);
    } catch (error) {
        console.error('Shelter delete error:', error);

        if (error.code === '23503') {
            return res.status(409).json({
                error: 'Negalima ištrinti prieglaudos, kol yra su ja susijusių įrašų (pvz., gyvūnų).'
            });
        }

        res.status(500).json({ error: 'Unable to delete shelter' });
    }
});

module.exports = router;
