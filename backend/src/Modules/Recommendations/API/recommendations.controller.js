// Controller responsible for handling recommendation requests

const recommendationService = require("../Application/recommendation.service");

async function submitQuestionnaire(req, res) {
  try {
    const payload = req.body;

    console.log("Received payload:", payload);
    console.log("API key exists:", !!process.env.API_NINJAS_KEY);

    if (!payload.petType) {
      return res.status(400).json({
        success: false,
        messageLt: "Trūksta augintinio tipo.",
      });
    }

    const recommendations =
      await recommendationService.getRecommendations(payload);

    return res.json({
      success: true,
      messageLt: "Rekomendacijos sėkmingai gautos.",
      recommendations,
    });
  } catch (error) {
    console.error("Recommendation error message:", error.message);
    console.error("Recommendation error status:", error.response?.status);
    console.error("Recommendation error data:", error.response?.data);

    if (error.message === "Invalid pet type") {
      return res.status(400).json({
        success: false,
        messageLt: "Neteisingas augintinio tipas.",
      });
    }

    return res.status(503).json({
      success: false,
      messageLt: "Rekomendacijų paslauga šiuo metu nepasiekiama.",
    });
  }
}

module.exports = { submitQuestionnaire };
