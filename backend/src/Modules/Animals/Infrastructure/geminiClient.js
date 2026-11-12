const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateAnimalDescription(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return (response.text || "").trim();
}

// Kol kas DI neįgyvendintas, todėl grąžiname tuščią rezultatą.
// Vėliau čia bus Gemini kvietimas; likusi sistema nesikeis.
//
// Įeina: gyvūnas (Pet su name, species, breed, age, size, activity_level, health_info, shelter_description)
// Išeina: { description: string | null, tags: string[] }
const generateProfile = async (pet) => {
    return { description: null, tags: [] };
};

module.exports = { generateAnimalDescription, generateProfile };
