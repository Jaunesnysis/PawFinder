// Antras apsaugos lygis po JSON Schema: tikrina struktūrą,
// išmeta nežinomas žymas ir dublikatus. Netinkamas atsakymas -> AiInvalidResponseError.

const { AiInvalidResponseError } = require("./AiError");
const { MAX_TAGS } = require("./responseSchemas");

const CRITERIA_VALUES = {
  species: ["Šuo", "Katė"],
  size: ["small", "medium", "large"],
  activityLevel: ["low", "moderate", "high"],
  livingSpace: ["apartment", "house"],
};
const CRITERIA_BOOLEANS = ["hasChildren", "hasOtherPets"];

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

const filterTags = (tags, allowedTags) => {
  if (!Array.isArray(tags)) throw new AiInvalidResponseError("Žymos nėra masyvas.");
  const allowed = new Set(allowedTags);
  const unique = [...new Set(tags.filter((t) => typeof t === "string"))];
  return unique.filter((t) => allowed.has(t)).slice(0, MAX_TAGS);
};

const validateAnimalProfile = (raw, allowedTags) => {
  if (!isObject(raw)) throw new AiInvalidResponseError("Atsakymas nėra objektas.");

  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  if (description.length < 50) {
    throw new AiInvalidResponseError("Aprašymas tuščias arba per trumpas.");
  }

  return { description, tags: filterTags(raw.tags, allowedTags) };
};

const validateLifestyleAnalysis = (raw, allowedTags) => {
  if (!isObject(raw) || !isObject(raw.criteria)) {
    throw new AiInvalidResponseError("Trūksta kriterijų objekto.");
  }

  const criteria = {};
  for (const [key, values] of Object.entries(CRITERIA_VALUES)) {
    criteria[key] = values.includes(raw.criteria[key]) ? raw.criteria[key] : null;
  }
  for (const key of CRITERIA_BOOLEANS) {
    criteria[key] = typeof raw.criteria[key] === "boolean" ? raw.criteria[key] : null;
  }

  return { criteria, tags: filterTags(raw.tags, allowedTags) };
};

const validateWalkFeedback = (raw, allowedTags) => {
  if (!isObject(raw) || !Array.isArray(raw.observations)) {
    throw new AiInvalidResponseError("Trūksta pastebėjimų masyvo.");
  }

  const observations = raw.observations
    .filter((o) => typeof o === "string")
    .map((o) => o.trim())
    .filter((o) => o.length > 0)
    .slice(0, 5);

  return {
    observations,
    suggestedTags: filterTags(raw.suggestedTags, allowedTags),
  };
};

module.exports = {
  validateAnimalProfile,
  validateLifestyleAnalysis,
  validateWalkFeedback,
};
