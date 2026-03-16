const { generateDescription } = require("./animals.controller");
const service = require("../Application/generateAnimalDescription.service");

jest.mock("../Application/generateAnimalDescription.service", () => ({
  createAnimalDescription: jest.fn(),
}));

test("should return generated description when service succeeds", async () => {
  service.createAnimalDescription.mockResolvedValue("Labai draugiškas šuo.");

  const req = {
    body: {
      name: "Rikis",
      species: "Šuo",
    },
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  await generateDescription(req, res);

  expect(service.createAnimalDescription).toHaveBeenCalledWith({
    name: "Rikis",
    species: "Šuo",
  });

  expect(res.json).toHaveBeenCalledWith({
    success: true,
    messageLt: "DI aprašymas sėkmingai sugeneruotas.",
    aiDescription: "Labai draugiškas šuo.",
  });
});
