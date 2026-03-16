// Service responsible for generating animal descriptions using AI
const { generateAnimalDescription } = require("../Infrastructure/geminiClient");
const {
  buildAnimalDescriptionPrompt,
} = require("../Domain/animalDescriptionPrompt");

async function createAnimalDescription(animal) {
  const prompt = buildAnimalDescriptionPrompt(animal);
  const text = await generateAnimalDescription(prompt);

  return text;
}

module.exports = { createAnimalDescription };
