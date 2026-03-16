const express = require('express');
const router = express.Router();

const shelterService = require('../Application/shelterService');

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
