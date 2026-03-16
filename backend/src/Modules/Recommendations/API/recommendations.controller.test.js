const { submitQuestionnaire } = require("./recommendations.controller");
const recommendationService = require("../Application/recommendation.service");

jest.mock("../Application/recommendation.service", () => ({
  getRecommendations: jest.fn(),
}));

test("should return recommendations when service succeeds", async () => {
  const fakeRecommendations = [
    { breedName: "Labrador Retriever", petType: "dog" },
    { breedName: "Golden Retriever", petType: "dog" },
  ];

  recommendationService.getRecommendations.mockResolvedValue(
    fakeRecommendations,
  );

  const req = {
    body: {
      petType: "dog",
      energy: 4,
      playfulness: 5,
    },
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  await submitQuestionnaire(req, res);

  expect(recommendationService.getRecommendations).toHaveBeenCalledWith({
    petType: "dog",
    energy: 4,
    playfulness: 5,
  });

  expect(res.json).toHaveBeenCalledWith({
    success: true,
    messageLt: "Rekomendacijos sėkmingai gautos.",
    recommendations: fakeRecommendations,
  });
});
