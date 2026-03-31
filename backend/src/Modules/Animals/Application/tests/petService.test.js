// ✅ ALL mocks BEFORE any require
jest.mock("../../Infrastructure/petRepository");
jest.mock("../../../Notifications/Application/notificationService");
jest.mock("../../../Infrastructure/db", () => ({ query: jest.fn() }));

const petService = require("../petService");
const petRepository = require("../../Infrastructure/petRepository");

describe("PetService - getAvailablePets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("turi grąžinti tik laisvus gyvūnus pasirinktame mieste", async () => {
    const mockData = [
      { id: 1, name: "Rikis", city: "Vilnius", status: "Laisvas" },
      { id: 2, name: "Bosas", city: "Vilnius", status: "Rezervuotas" },
    ];

    petRepository.findAvailableByCity.mockResolvedValue([mockData[0]]);

    const result = await petService.getAvailablePets("Vilnius");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Rikis");
    expect(result[0].status).toBe("Laisvas");
  });

  test("turi iškviesti repository su teisingu miesto pavadinimu", async () => {
    petRepository.findAvailableByCity.mockResolvedValue([]);

    await petService.getAvailablePets("Kaunas");

    expect(petRepository.findAvailableByCity).toHaveBeenCalledWith("Kaunas");
  });
});
