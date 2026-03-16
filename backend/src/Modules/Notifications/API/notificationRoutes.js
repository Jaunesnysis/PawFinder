const express = require('express');
const router = express.Router();
const notificationService = require('../Application/notificationService');

// Mock authorization
const authorizeShelter = (req, res, next) => {
    const loggedInShelterId = 101; // Mock shelter ID
    req.shelter = { id: loggedInShelterId };
    next();
};

/**
 * GET /api/notifications
 * Get notifications for the logged-in shelter
 */
router.get('/', authorizeShelter, async (req, res) => {
    try {
        const notifications = await notificationService.getNotificationsForShelter(req.shelter.id);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Serverio klaida.' });
    }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authorizeShelter, async (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);
        const notification = await notificationService.markNotificationAsRead(notificationId);
        if (!notification) {
            return res.status(404).json({ error: 'Pranešimas nerastas.' });
        }
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Serverio klaida.' });
    }
});

module.exports = router;