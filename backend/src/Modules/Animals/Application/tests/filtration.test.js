jest.mock('../../../../Infrastructure/db', () => ({
    query: jest.fn()
}));

const db = require('../../../../Infrastructure/db');
const { getAllAvailablePets } = require('../../Infrastructure/petRepository');

const mockPets = [
    {
        pet_id: 1,
        shelter_id: 1,
        name: "Rikis",
        species: "Šuo",
        breed: "Test",
        age: 5,
        size: "large",
        weight: 30,
        activity_level: "high",
        health_info: "",
        status: "available",
        city: "Vilnius",
        shelter_description: "",
        ai_description: "",
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        pet_id: 2,
        shelter_id: 1,
        name: "Mika",
        species: "Katė",
        breed: "Test",
        age: 2,
        size: "small",
        weight: 4,
        activity_level: "moderate",
        health_info: "",
        status: "available",
        city: "Kaunas",
        shelter_description: "",
        ai_description: "",
        created_at: new Date(),
        updated_at: new Date()
    }
];

describe("Pet filtering tests (DB mocked)", () => {

    beforeEach(() => {
        db.query.mockReset();
    });

    test("should return only dogs when species filter is applied", async () => {

        db.query.mockResolvedValue({
            rows: mockPets.filter(p => p.species === "Šuo")
        });

        const result = await getAllAvailablePets({ species: "Šuo" });

        // tikrina ar DB buvo kviesta
        expect(db.query).toHaveBeenCalled();

        // tikrina SQL
        expect(db.query.mock.calls[0][0]).toContain("species");

        result.forEach(pet => {
            expect(pet.species).toBe("Šuo");
        });
    });

    test("should return only pets from Vilnius", async () => {

        db.query.mockResolvedValue({
            rows: mockPets.filter(p => p.city === "Vilnius")
        });

        const result = await getAllAvailablePets({ city: "Vilnius" });

        expect(db.query).toHaveBeenCalled();
        expect(db.query.mock.calls[0][0]).toContain("city");

        result.forEach(pet => {
            expect(pet.city).toBe("Vilnius");
        });
    });

    test("should filter pets by minimum age", async () => {

        db.query.mockResolvedValue({
            rows: mockPets.filter(p => p.age >= 4)
        });

        const result = await getAllAvailablePets({ ageMin: 4 });

        expect(db.query).toHaveBeenCalled();
        expect(db.query.mock.calls[0][0]).toContain("age >=");

        result.forEach(pet => {
            expect(pet.age).toBeGreaterThanOrEqual(4);
        });
    });

});