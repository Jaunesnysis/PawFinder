const express = require("express");
const router = express.Router();
const feedbackService = require("../Application/feedbackService");
const authorizeUser = require("../../../Infrastructure/Middleware/authMiddleware");

const sendError = (res, error, label) => {
  console.error(`${label}:`, error.message || error);
  res
    .status(error.status || 500)
    .json({ error: error.status ? error.message : "Internal server error" });
};

// US-10: POST /api/feedback – savanoris pateikia atsiliepimą apie gyvūną po pavedžiojimo
// Body: { reservation_id, content }
router.post("/", authorizeUser, async (req, res) => {
  try {
    const feedback = await feedbackService.submitFeedback(
      req.user.id,
      req.body,
    );
    res.status(201).json({ message: "Atsiliepimas gautas.", feedback });
  } catch (error) {
    sendError(res, error, "Feedback submission error");
  }
});

module.exports = router;