// JSON Schema kiekvienai DI funkcijai. Leidžiamos žymos perduodamos kaip enum,
// todėl modelis negali grąžinti žymos, kurios nėra lentelėje "tag".

const MAX_TAGS = 6;

const tagArray = (allowedTags) => ({
  type: "array",
  items: { type: "string", enum: allowedTags },
  maxItems: MAX_TAGS,
});

const nullableEnum = (values) => ({
  anyOf: [{ type: "string", enum: values }, { type: "null" }],
});

const nullableBoolean = () => ({
  anyOf: [{ type: "boolean" }, { type: "null" }],
});

const animalProfileSchema = (allowedTags) => ({
  type: "object",
  properties: {
    description: { type: "string" },
    tags: tagArray(allowedTags),
  },
  required: ["description", "tags"],
});

const lifestyleAnalysisSchema = (allowedTags) => ({
  type: "object",
  properties: {
    criteria: {
      type: "object",
      properties: {
        species: nullableEnum(["Šuo", "Katė"]),
        size: nullableEnum(["small", "medium", "large"]),
        activityLevel: nullableEnum(["low", "moderate", "high"]),
        hasChildren: nullableBoolean(),
        hasOtherPets: nullableBoolean(),
        livingSpace: nullableEnum(["apartment", "house"]),
      },
      required: [
        "species",
        "size",
        "activityLevel",
        "hasChildren",
        "hasOtherPets",
        "livingSpace",
      ],
    },
    tags: tagArray(allowedTags),
  },
  required: ["criteria", "tags"],
});

const walkFeedbackSchema = (allowedTags) => ({
  type: "object",
  properties: {
    observations: {
      type: "array",
      items: { type: "string" },
      maxItems: 5,
    },
    suggestedTags: tagArray(allowedTags),
  },
  required: ["observations", "suggestedTags"],
});

module.exports = {
  MAX_TAGS,
  animalProfileSchema,
  lifestyleAnalysisSchema,
  walkFeedbackSchema,
};
