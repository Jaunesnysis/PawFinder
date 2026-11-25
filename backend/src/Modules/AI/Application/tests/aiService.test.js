jest.mock("../../Infrastructure/geminiClient");
jest.mock("../../../Tags/Infrastructure/tagRepository");

const geminiClient = require("../../Infrastructure/geminiClient");
const tagRepository = require("../../../Tags/Infrastructure/tagRepository");
const aiService = require("../aiService");
const { AiInvalidResponseError, AiUnavailableError } = require("../../Domain/AiError");

const TAGS = ["ACTIVE", "CALM", "FRIENDLY", "PLAYFUL"];
const LONG_TEXT =
  "Reksas yra draugiškas ir žaismingas šuo, kuris mėgsta ilgus pasivaikščiojimus parke.";

const pet = {
  name: "Reksas",
  species: "Šuo",
  breed: "Mišrūnas",
  age: 3,
  size: "medium",
  weight: 18,
  activity_level: "high",
  health_info: null,
  shelter_description: "Mėgsta bėgioti.",
};

beforeEach(() => {
  jest.resetAllMocks();
  tagRepository.getAllTagNames.mockResolvedValue(TAGS);
});

describe("generateAnimalProfile", () => {
  test("grąžina aprašymą ir tik leidžiamas žymas", async () => {
    geminiClient.generateJson.mockResolvedValue({
      description: LONG_TEXT,
      tags: ["ACTIVE", "PLAYFUL", "INVENTED_TAG", "ACTIVE"],
    });

    const result = await aiService.generateAnimalProfile(pet);

    expect(result).toEqual({ description: LONG_TEXT, tags: ["ACTIVE", "PLAYFUL"] });
  });

  test("užklausoje perduodami gyvūno duomenys, žymos ir schema su enum", async () => {
    geminiClient.generateJson.mockResolvedValue({ description: LONG_TEXT, tags: [] });

    await aiService.generateAnimalProfile(pet);

    const call = geminiClient.generateJson.mock.calls[0][0];
    expect(call.prompt).toContain("Reksas");
    expect(call.prompt).toContain("Mėgsta bėgioti.");
    expect(call.prompt).toContain("ACTIVE, CALM, FRIENDLY, PLAYFUL");
    expect(call.schema.properties.tags.items.enum).toEqual(TAGS);
  });

  test("netinkamas atsakymas kartojamas vieną kartą", async () => {
    geminiClient.generateJson
      .mockResolvedValueOnce({ description: "", tags: [] })
      .mockResolvedValueOnce({ description: LONG_TEXT, tags: ["CALM"] });

    const result = await aiService.generateAnimalProfile(pet);

    expect(geminiClient.generateJson).toHaveBeenCalledTimes(2);
    expect(result.tags).toEqual(["CALM"]);
  });

  test("po dviejų netinkamų atsakymų metama AiInvalidResponseError", async () => {
    geminiClient.generateJson.mockResolvedValue({ description: "per trumpas", tags: [] });

    await expect(aiService.generateAnimalProfile(pet)).rejects.toBeInstanceOf(
      AiInvalidResponseError,
    );
    expect(geminiClient.generateJson).toHaveBeenCalledTimes(2);
  });

  test("nepasiekiama paslauga nekartojama", async () => {
    geminiClient.generateJson.mockRejectedValue(new AiUnavailableError("timeout"));

    await expect(aiService.generateAnimalProfile(pet)).rejects.toBeInstanceOf(
      AiUnavailableError,
    );
    expect(geminiClient.generateJson).toHaveBeenCalledTimes(1);
  });
});

describe("analyzeLifestyle", () => {
  test("grąžina kriterijus, nežinomas reikšmes paverčia null", async () => {
    geminiClient.generateJson.mockResolvedValue({
      criteria: {
        species: "Šuo",
        size: "huge",
        activityLevel: "high",
        hasChildren: true,
        hasOtherPets: "maybe",
        livingSpace: null,
      },
      tags: ["ACTIVE", "FRIENDLY"],
    });

    const result = await aiService.analyzeLifestyle("Gyvenu name su vaikais...");

    expect(result).toEqual({
      criteria: {
        species: "Šuo",
        size: null,
        activityLevel: "high",
        hasChildren: true,
        hasOtherPets: null,
        livingSpace: null,
      },
      tags: ["ACTIVE", "FRIENDLY"],
    });
  });

  test("be kriterijų objekto atsakymas netinkamas", async () => {
    geminiClient.generateJson.mockResolvedValue({ tags: ["CALM"] });

    await expect(aiService.analyzeLifestyle("tekstas")).rejects.toBeInstanceOf(
      AiInvalidResponseError,
    );
  });
});

describe("analyzeWalkFeedback", () => {
  test("grąžina pastebėjimus ir siūlomas žymas", async () => {
    geminiClient.generateJson.mockResolvedValue({
      observations: [" Ramiai reagavo į kitus šunis ", "", "Traukė pavadėlį"],
      suggestedTags: ["CALM", "NOT_A_TAG"],
    });

    const result = await aiService.analyzeWalkFeedback({
      feedback: "Buvo ramus, bet traukė pavadėlį.",
      pet: { name: "Reksas", species: "Šuo", ai_description: null, tags: ["ACTIVE"] },
    });

    expect(result).toEqual({
      observations: ["Ramiai reagavo į kitus šunis", "Traukė pavadėlį"],
      suggestedTags: ["CALM"],
    });
    expect(geminiClient.generateJson.mock.calls[0][0].prompt).toContain(
      "Buvo ramus, bet traukė pavadėlį.",
    );
  });
});
