const express = require("express");
const router = express.Router();
const notificationService = require("../Application/notificationService");
const authorizeUser = require("../../../Infrastructure/Middleware/authMiddleware");

/**
 * GET /api/notifications
 * Prisijungusio vartotojo (savanorio arba prieglaudos darbuotojo) pranešimai
 */
router.get("/", authorizeUser, async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.user.id);
    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error.message);
    res.status(500).json({ error: "Serverio klaida." });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Pažymi savo pranešimą kaip perskaitytą
 */
router.put("/:id/read", authorizeUser, async (req, res) => {
  try {
    const notificationId = Number(req.params.id);
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({ error: "Neteisingas pranešimo ID." });
    }

    const notification = await notificationService.markNotificationAsRead(
      notificationId,
      req.user.id,
    );
    if (!notification) {
      return res.status(404).json({ error: "Pranešimas nerastas." });
    }
    res.json(notification);
  } catch (error) {
    console.error("Mark notification as read error:", error.message);
    res.status(500).json({ error: "Serverio klaida." });
  }
});

module.exports = router;
