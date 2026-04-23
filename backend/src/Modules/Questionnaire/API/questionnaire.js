const express = require("express");
const router = express.Router();
const authorizeUser = require("../../../Infrastructure/Middleware/authMiddleware");
const {
  submitQuestionnaire,
} = require("../../Recommendations/API/recommendations.controller");

// POST /api/questionnaire
// router.post("/", authorizeUser, (req, res) => {
//   try {
//     const data = req.body;
//     // Validate that data is object
//     if (typeof data !== "object" || data === null) {
//       return res.status(400).json({ error: "Invalid data format" });
//     }
//     // For now, just log and return
//     console.log("Received questionnaire data:", data);
//     res.json({ message: "Questionnaire submitted successfully", data });
//   } catch (error) {
//     console.error("Error processing questionnaire:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
router.post("/", authorizeUser, submitQuestionnaire);

module.exports = router;
