// DI paslaugų sluoksnis. Kiekviena funkcija vykdo tą patį algoritmą:
// 1. priima duomenis, 2. parenka šabloną, 3. suformuoja užklausą su leidžiamomis žymomis
// ir atsakymo struktūra, 4. siunčia DI paslaugai HTTPS ryšiu, 5. patikrina ir grąžina rezultatą.
// Duomenų šis sluoksnis nesaugo – tai daro užklausą pateikęs komponentas.

const geminiClient = require("../Infrastructure/geminiClient");
const tagRepository = require("../../Tags/Infrastructure/tagRepository");
const { AiInvalidResponseError } = require("../Domain/AiError");
const schemas = require("../Domain/responseSchemas");
const validator = require("../Domain/aiResultValidator");
const { buildAnimalProfilePrompt } = require("../Domain/prompts/animalProfile.prompt");
const { buildLifestyleAnalysisPrompt } = require("../Domain/prompts/lifestyleAnalysis.prompt");
const { buildWalkFeedbackPrompt } = require("../Domain/prompts/walkFeedback.prompt");

const MAX_ATTEMPTS = 2; // netinkamas atsakymas -> vienas pakartojimas

const runTask = async ({ input, buildPrompt, buildSchema, validate }) => {
  const allowedTags = await tagRepository.getAllTagNames();
  const { systemInstruction, prompt } = buildPrompt(input, allowedTags);
  const schema = buildSchema(allowedTags);

  for (let attempt = 1; ; attempt++) {
    try {
      const raw = await geminiClient.generateJson({ systemInstruction, prompt, schema });
      return validate(raw, allowedTags);
    } catch (error) {
      const canRetry = error instanceof AiInvalidResponseError && attempt < MAX_ATTEMPTS;
      if (!canRetry) throw error;
    }
  }
};

/**
 * 1 funkcija. Įeina: Pet (name, species, breed, age, size, weight,
 * activity_level, health_info, shelter_description).
 * Išeina: { description: string, tags: string[] }
 */
const generateAnimalProfile = (pet) =>
  runTask({
    input: pet,
    buildPrompt: buildAnimalProfilePrompt,
    buildSchema: schemas.animalProfileSchema,
    validate: validator.validateAnimalProfile,
  });

/**
 * 2 funkcija. Įeina: naudotojo gyvenimo būdo tekstas.
 * Išeina: { criteria: {...}, tags: string[] }
 */
const analyzeLifestyle = (lifestyleText) =>
  runTask({
    input: lifestyleText,
    buildPrompt: buildLifestyleAnalysisPrompt,
    buildSchema: schemas.lifestyleAnalysisSchema,
    validate: validator.validateLifestyleAnalysis,
  });

/**
 * 3 funkcija. Įeina: { feedback: string, pet: { name, species, ai_description, tags } }.
 * Išeina: { observations: string[], suggestedTags: string[] }
 */
const analyzeWalkFeedback = ({ feedback, pet }) =>
  runTask({
    input: { feedback, pet },
    buildPrompt: buildWalkFeedbackPrompt,
    buildSchema: schemas.walkFeedbackSchema,
    validate: validator.validateWalkFeedback,
  });

module.exports = { generateAnimalProfile, analyzeLifestyle, analyzeWalkFeedback };
