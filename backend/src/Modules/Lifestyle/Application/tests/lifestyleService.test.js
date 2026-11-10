jest.mock("../../../../Infrastructure/db", () => ({ query: jest.fn() }));
jest.mock("../../Infrastructure/lifestyleRepository");

const lifestyleRepository = require("../../Infrastructure/lifestyleRepository");
const lifestyleService = require("../lifestyleService");
const { MIN_LENGTH } = require("../../Domain/LifestyleDescription");

const volunteer = { id: 7, role: "volunteer" };
const shelter = { id: 3, role: "shelter" };
const validText = "Gyvenu bute Vilniuje, dirbu iš namų. ".repeat(6); // > 200

describe("lifestyleService (US-02)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getLifestyle", () => {
    test("grąžina null aprašymą ir tuščius tagus, kai vartotojas dar nepildė", async () => {
      lifestyleRepository.findDescriptionByUserId.mockResolvedValue({
        user_id: 7,
        life_description: null,
      });
      lifestyleRepository.findTagNamesByUserId.mockResolvedValue([]);

      const result = await lifestyleService.getLifestyle(volunteer);

      expect(lifestyleRepository.findDescriptionByUserId).toHaveBeenCalledWith(7);
      expect(result).toEqual({ description: null, tags: [] });
    });

    test("grąžina aprašymą ir vartotojo tagus", async () => {
      lifestyleRepository.findDescriptionByUserId.mockResolvedValue({
        user_id: 7,
        life_description: validText.trim(),
      });
      lifestyleRepository.findTagNamesByUserId.mockResolvedValue(["butas", "ramus"]);

      const result = await lifestyleService.getLifestyle(volunteer);

      expect(result).toEqual({ description: validText.trim(), tags: ["butas", "ramus"] });
    });

    test("prieglaudai grąžina 403", async () => {
      await expect(lifestyleService.getLifestyle(shelter)).rejects.toMatchObject({
        status: 403,
      });
      expect(lifestyleRepository.findDescriptionByUserId).not.toHaveBeenCalled();
    });

    test("grąžina 404, kai vartotojo nėra", async () => {
      lifestyleRepository.findDescriptionByUserId.mockResolvedValue(null);
      await expect(lifestyleService.getLifestyle(volunteer)).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe("saveLifestyle", () => {
    test("išsaugo apkarpytą tekstą (AC2.2)", async () => {
      lifestyleRepository.saveDescription.mockResolvedValue({
        user_id: 7,
        life_description: validText.trim(),
      });
      lifestyleRepository.findTagNamesByUserId.mockResolvedValue([]);

      const result = await lifestyleService.saveLifestyle(volunteer, {
        description: `  ${validText}  `,
        consent: true,
      });

      expect(lifestyleRepository.saveDescription).toHaveBeenCalledWith(7, validText.trim());
      expect(result).toEqual({ description: validText.trim(), tags: [] });
    });

    test("neišsaugo tuščio aprašymo", async () => {
      await expect(
        lifestyleService.saveLifestyle(volunteer, { description: "", consent: true }),
      ).rejects.toMatchObject({ status: 400 });
      expect(lifestyleRepository.saveDescription).not.toHaveBeenCalled();
    });

    test("neišsaugo per trumpo aprašymo", async () => {
      await expect(
        lifestyleService.saveLifestyle(volunteer, {
          description: "a".repeat(MIN_LENGTH - 1),
          consent: true,
        }),
      ).rejects.toMatchObject({ status: 400, message: expect.stringMatching(/per trumpas/) });
      expect(lifestyleRepository.saveDescription).not.toHaveBeenCalled();
    });

    test("neišsaugo per ilgo aprašymo", async () => {
      await expect(
        lifestyleService.saveLifestyle(volunteer, {
          description: "a".repeat(2001),
          consent: true,
        }),
      ).rejects.toMatchObject({ status: 400, message: expect.stringMatching(/per ilgas/) });
      expect(lifestyleRepository.saveDescription).not.toHaveBeenCalled();
    });

    test("neišsaugo be sutikimo", async () => {
      await expect(
        lifestyleService.saveLifestyle(volunteer, { description: validText }),
      ).rejects.toMatchObject({ status: 400, message: expect.stringMatching(/sutikimą/) });
      expect(lifestyleRepository.saveDescription).not.toHaveBeenCalled();
    });

    test("prieglauda negali išsaugoti aprašymo", async () => {
      await expect(
        lifestyleService.saveLifestyle(shelter, { description: validText, consent: true }),
      ).rejects.toMatchObject({ status: 403 });
    });

    test("perduoda DB klaidą toliau, kad API grąžintų 500 (AC2.4)", async () => {
      lifestyleRepository.saveDescription.mockRejectedValue(
        new Error("[lifestyleRepository.saveDescription] connection lost"),
      );

      await expect(
        lifestyleService.saveLifestyle(volunteer, { description: validText, consent: true }),
      ).rejects.toThrow("connection lost");
    });
  });

  describe("getSuggestedPets", () => {
    test("grąžina gyvūnus su id ir sutapusių tagų skaičiumi", async () => {
      lifestyleRepository.findSuggestedPets.mockResolvedValue([
        { pet_id: 5, name: "Mika", species: "Katė", status: "available", matched_tags: 3 },
        { pet_id: 2, name: "Rikis", species: "Šuo", status: "available", matched_tags: 1 },
      ]);

      const result = await lifestyleService.getSuggestedPets(volunteer);

      expect(lifestyleRepository.findSuggestedPets).toHaveBeenCalledWith(7);
      expect(result.map((p) => [p.id, p.name, p.matched_tags])).toEqual([
        [5, "Mika", 3],
        [2, "Rikis", 1],
      ]);
    });

    test("prieglaudai grąžina 403", async () => {
      await expect(lifestyleService.getSuggestedPets(shelter)).rejects.toMatchObject({
        status: 403,
      });
    });
  });
});
