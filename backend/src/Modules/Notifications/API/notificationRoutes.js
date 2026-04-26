const express = require('express');
const router = express.Router();
const notificationService = require('../Application/notificationService');
const authorizeUser = require('../../../Infrastructure/Middleware/authMiddleware');


/**
 * GET /api/notifications
 * Get notifications for the logged-in user(volunteer or shelter)
 */
router.get('/', authorizeUser, async (req, res) => {
    try {
        // Gauti pranešimus pagal shelter_id iš JWT token'o
        const notifications = await notificationService.getNotifications(req.user.id, req.user.shelterId);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Serverio klaida.' });
    }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authorizeUser, async (req, res) => {
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