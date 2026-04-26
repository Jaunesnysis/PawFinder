const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function findBestShelterMatch(
  ninjaSuggestions,
  shelterBreeds,
  petType,
  questionnaireAnswers,
) {
  let prompt;

  if (ninjaSuggestions && ninjaSuggestions.length > 0) {
    const ninjaNames = ninjaSuggestions.map((b) => b.name).join(", ");
    prompt = `You are a pet adoption assistant. 
A user completed a questionnaire and these breeds were suggested for them: ${ninjaNames}.
From the following breeds available in our shelter: ${shelterBreeds.join(", ")}.
Which single breed is the closest match? 
Reply with ONLY the breed name from the shelter list, nothing else.`;
  } else {
    prompt = `You are a pet adoption assistant.
A user completed a questionnaire with these preferences: ${JSON.stringify(questionnaireAnswers)}.
They are looking for a ${petType}.
From the following breeds available in our shelter: ${shelterBreeds.join(", ")}.
Which single breed would suit them best?
Reply with ONLY the breed name from the shelter list, nothing else.`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return (response.text || "").trim();
}

module.exports = { findBestShelterMatch };
