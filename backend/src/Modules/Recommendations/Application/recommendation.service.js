const { getDogs, getCats } = require("../Infrastructure/apiNinjasClient");
const { findBestShelterMatch } = require("./gemini.service");
const petService = require("../../Animals/Application/petService");

// Simple in-memory cache for shelter breeds
const breedsCache = {
  dog: null,
  cat: null,
  lastFetched: {},
};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function getCachedBreeds(petType) {
  const now = Date.now();
  const lastFetched = breedsCache.lastFetched[petType] || 0;

  if (breedsCache[petType] && now - lastFetched < CACHE_TTL) {
    console.log(`Using cached breeds for ${petType}`);
    return breedsCache[petType];
  }

  const breeds = await petService.getDistinctBreeds(petType);
  breedsCache[petType] = breeds;
  breedsCache.lastFetched[petType] = now;
  return breeds;
}

async function getRecommendations(data) {
  const { petType, ...filters } = data;

  if (petType !== "dog" && petType !== "cat") {
    throw new Error("Invalid pet type");
  }

  // Run API Ninjas + shelter breeds fetch in parallel
  const [ninjaResults, shelterBreeds] = await Promise.all([
    petType === "dog" ? getDogs(filters) : getCats(filters),
    getCachedBreeds(petType),
  ]);

  const topSuggestions = ninjaResults.slice(0, 3);

  const shelterMatch = await findBestShelterMatch(
    topSuggestions,
    shelterBreeds,
    petType,
    filters,
  );

  return {
    ninjaSuggestions: topSuggestions,
    shelterMatch,
  };
}

module.exports = { getRecommendations };
