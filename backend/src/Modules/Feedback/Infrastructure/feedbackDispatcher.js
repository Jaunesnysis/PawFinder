const petRepository = require("../../Animals/Infrastructure/petRepository");
const aiService = require("../../AI/Application/aiService");

/**
 * US-10: atsiliepimo perdavimo taškas į DI paslaugų sluoksnį (AC10.4).
 *
 * Atsiliepimo tekstas duomenų bazėje nesaugomas – jis čia perduodamas kaip JSON objektas:
 *   { reservation_id, pet_id, user_id, content }
 *
 * Eiga:
 * 1. Užkraunamas gyvūnas ir jo dabartinės žymos.
 * 2. DI (3 funkcija) iš atsiliepimo išskiria pastebėjimus ir siūlomas žymas.
 * 3. DI (1 funkcija) atnaujina gyvūno aprašymą, įtraukdamas naujus pastebėjimus.
 * 4. Išsaugomas naujas aprašymas ir žymos: dabartinės + DI pasiūlytos.
 *
 * Jei funkcija meta klaidą, feedbackService grąžina `feedback_received` į FALSE,
 * todėl savanoris gali pateikti atsiliepimą dar kartą ir tekstas nedingsta.
 * Atsiliepimo teksto nerašyti į žurnalą (console.log), nes jis nesaugomas sąmoningai.
 */
const dispatchFeedback = async ({ pet_id, content }) => {
  const pet = await petRepository.findPetById(pet_id);
  if (!pet) throw new Error(`Gyvūnas ${pet_id} nerastas.`);

  const currentTags = await petRepository.findTagNamesByPetId(pet_id);

  const { observations, suggestedTags } = await aiService.analyzeWalkFeedback({
    feedback: content,
    pet: { ...pet, tags: currentTags },
  });

  // Atsiliepime nebuvo nieko apie gyvūno elgesį – profilio nekeičiame
  if (observations.length === 0 && suggestedTags.length === 0) return;

  const profile = await aiService.generateAnimalProfile({
    ...pet,
    walk_observations: observations,
  });

  const tags = [...new Set([...currentTags, ...suggestedTags])];
  await petRepository.saveAiProfile(pet_id, profile.description, tags);
};

module.exports = { dispatchFeedback };
