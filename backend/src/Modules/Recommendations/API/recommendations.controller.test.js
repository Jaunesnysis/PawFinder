const { submitQuestionnaire } = require("./recommendations.controller");
const recommendationService = require("../Application/recommendation.service");

jest.mock("../Application/recommendation.service", () => ({
  getRecommendations: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// Helper: build a standard mock res object
function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

// ─────────────────────────────────────────────
// TC1 — Valid dog request with filters returns recommendations (EP)
// AC coverage: AC1, AC3
// ─────────────────────────────────────────────
test("TC1: valid dog request with filters returns recommendations", async () => {
  const fakeRecommendations = [
    { breedName: "Labrador Retriever", petType: "dog" },
    { breedName: "Golden Retriever", petType: "dog" },
  ];
  recommendationService.getRecommendations.mockResolvedValue(
    fakeRecommendations,
  );

  const req = { body: { petType: "dog", energy: 4, playfulness: 5 } };
  const res = mockRes();

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

// ─────────────────────────────────────────────
// TC2 — Valid cat request returns recommendations (EP)
// AC coverage: AC1, AC3
// ─────────────────────────────────────────────
test("TC2: valid cat request returns recommendations", async () => {
  const fakeCatRecommendations = [
    { breedName: "Siamese", petType: "cat" },
    { breedName: "Maine Coon", petType: "cat" },
  ];
  recommendationService.getRecommendations.mockResolvedValue(
    fakeCatRecommendations,
  );

  const req = { body: { petType: "cat", grooming: 3 } };
  const res = mockRes();

  await submitQuestionnaire(req, res);

  expect(recommendationService.getRecommendations).toHaveBeenCalledWith({
    petType: "cat",
    grooming: 3,
  });
  expect(res.json).toHaveBeenCalledWith({
    success: true,
    messageLt: "Rekomendacijos sėkmingai gautos.",
    recommendations: fakeCatRecommendations,
  });
});

// ─────────────────────────────────────────────
// TC3 — Missing petType returns 400 (BVA — absent required field)
// AC coverage: AC2
// ─────────────────────────────────────────────
test("TC3: missing petType returns 400 Bad Request", async () => {
  const req = { body: { energy: 3 } }; // petType deliberately absent
  const res = mockRes();

  await submitQuestionnaire(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    messageLt: "Trūksta augintinio tipo.",
  });
  expect(recommendationService.getRecommendations).not.toHaveBeenCalled();
});

// ─────────────────────────────────────────────
// TC4 — Empty string petType returns 400 (BVA — boundary: falsy string)
// AC coverage: AC2
// ─────────────────────────────────────────────
test("TC4: empty string petType returns 400 Bad Request", async () => {
  const req = { body: { petType: "" } }; // empty string is falsy
  const res = mockRes();

  await submitQuestionnaire(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    messageLt: "Trūksta augintinio tipo.",
  });
  expect(recommendationService.getRecommendations).not.toHaveBeenCalled();
});

// ─────────────────────────────────────────────
// TC5 — All supported filters are forwarded to the service correctly (EP)
// AC coverage: AC3
// ─────────────────────────────────────────────
test("TC5: all filters are passed to service without modification", async () => {
  recommendationService.getRecommendations.mockResolvedValue([]);

  const fullPayload = {
    petType: "dog",
    energy: 5,
    playfulness: 4,
    barking: 2,
    protectiveness: 3,
    trainability: 5,
    family_friendly: 4,
    grooming: 2,
    other_pets_friendly: 3,
    children_friendly: 5,
  };

  const req = { body: { ...fullPayload } };
  const res = mockRes();

  await submitQuestionnaire(req, res);

  expect(recommendationService.getRecommendations).toHaveBeenCalledWith(
    fullPayload,
  );
});

// ─────────────────────────────────────────────
// TC6 — External service failure returns 503 (Error Guessing)
// AC coverage: AC4
// ─────────────────────────────────────────────
test("TC6: service error returns 503 with Lithuanian error message", async () => {
  recommendationService.getRecommendations.mockRejectedValue(
    new Error("API timeout"),
  );

  const req = { body: { petType: "dog" } };
  const res = mockRes();

  await submitQuestionnaire(req, res);

  expect(res.status).toHaveBeenCalledWith(503);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    messageLt: "Rekomendacijų paslauga šiuo metu nepasiekiama.",
  });
});

// ─────────────────────────────────────────────
// TC7 — Invalid petType "bird" causes unhandled service error → 503 (Error Guessing)
// AC coverage: AC5
// BUG: controller returns 503 instead of 400 for invalid petType.
//      The service throws "Invalid pet type" but the controller catches it
//      and wraps ALL errors as 503, masking input-validation errors.
// ─────────────────────────────────────────────
test("TC7: invalid petType 'bird' should return 400 but returns 503 — BUG", async () => {
  // The service throws when petType is neither "dog" nor "cat"
  recommendationService.getRecommendations.mockRejectedValue(
    new Error("Invalid pet type"),
  );

  const req = { body: { petType: "bird" } };
  const res = mockRes();

  await submitQuestionnaire(req, res);

  // EXPECTED (correct behaviour): 400 with a validation message
  // ACTUAL (buggy behaviour):     503 — the catch block treats ALL errors as service failures
  expect(res.status).toHaveBeenCalledWith(400); // ← this assertion FAILS → FAIL result
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({ success: false }),
  );
});
