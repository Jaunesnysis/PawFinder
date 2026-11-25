// Vienintelis failas, kuris kreipiasi į Gemini API (HTTPS).
// Grąžina jau išparsintą JSON objektą arba meta DI klaidą.

const { GoogleGenAI } = require("@google/genai");
const {
  AiUnavailableError,
  AiInvalidResponseError,
} = require("../Domain/AiError");

const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const DEFAULT_TIMEOUT_MS = 15000;

let client = null;

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new AiUnavailableError("GEMINI_API_KEY nenustatytas .env faile.");
  }
  if (!client) {
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        timeout: Number(process.env.AI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
      },
    });
  }
  return client;
};

/**
 * @param {object} params
 * @param {string} params.systemInstruction - modelio vaidmuo ir taisyklės
 * @param {string} params.prompt - užduotis su duomenimis
 * @param {object} params.schema - JSON Schema laukiamam atsakymui
 * @param {number} [params.temperature]
 * @returns {Promise<object>}
 */
async function generateJson({ systemInstruction, prompt, schema, temperature = 0.4 }) {
  const ai = getClient();

  let response;
  try {
    response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        temperature,
        responseMimeType: "application/json",
        responseJsonSchema: schema,
      },
    });
  } catch (error) {
    throw new AiUnavailableError(error.message);
  }

  try {
    return JSON.parse(response.text || "");
  } catch {
    throw new AiInvalidResponseError("Atsakymas nėra galiojantis JSON.");
  }
}

module.exports = { generateJson };
