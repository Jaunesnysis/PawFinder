// Controller responsible for handling animal related API requests
const {
  createAnimalDescription,
} = require("../Application/generateAnimalDescription.service");

async function generateDescription(req, res) {
  try {
    const animal = req.body;

    if (!animal || !animal.name || !animal.species) {
      return res.status(400).json({
        success: false,
        messageLt: "Trūksta gyvūno duomenų.",
      });
    }

    const aiDescription = await createAnimalDescription(animal);

    return res.json({
      success: true,
      messageLt: "DI aprašymas sėkmingai sugeneruotas.",
      aiDescription,
    });
  } catch (error) {
    console.error("Gemini error message:", error.message);
    console.error("Gemini error status:", error.response?.status);
    console.error("Gemini error data:", error.response?.data);

    return res.status(503).json({
      success: false,
      messageLt: "DI aprašymo generavimo paslauga šiuo metu nepasiekiama.",
    });
  }
}

module.exports = { generateDescription };
