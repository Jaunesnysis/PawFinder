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

    test("should filter pets by breed", async () => {
        db.query.mockResolvedValue({ rows: [] });

        await getAllAvailablePets({ breed: "Labradoras" });

        expect(db.query).toHaveBeenCalledWith("SELECT * FROM pets WHERE 1=1 AND breed = $1", ["Labradoras"]);
    });

    test("should filter pets by size", async () => {
        db.query.mockResolvedValue({ rows: [] });

        await getAllAvailablePets({ size: "small" });

        expect(db.query).toHaveBeenCalledWith("SELECT * FROM pets WHERE 1=1 AND size = $1", ["small"]);
    });

    test("should map activity filter to activity_level column", async () => {
        db.query.mockResolvedValue({ rows: [] });

        await getAllAvailablePets({ activity: "high" });

        expect(db.query).toHaveBeenCalledWith("SELECT * FROM pets WHERE 1=1 AND activity_level = $1", ["high"]);
    });

    test("should filter pets by maximum age and convert it to number", async () => {
        db.query.mockResolvedValue({ rows: [] });

        await getAllAvailablePets({ ageMax: "6" });

        expect(db.query).toHaveBeenCalledWith("SELECT * FROM pets WHERE 1=1 AND age <= $1", [6]);
    });

    test("should filter pets by weight range and convert values to numbers", async () => {
        db.query.mockResolvedValue({ rows: [] });

        await getAllAvailablePets({ weightMin: "3", weightMax: "25" });

        expect(db.query).toHaveBeenCalledWith(
            "SELECT * FROM pets WHERE 1=1 AND weight >= $1 AND weight <= $2",
            [3, 25]
        );
    });

    test("should combine all filters in a fixed order with sequential placeholders", async () => {
        db.query.mockResolvedValue({ rows: [] });

        await getAllAvailablePets({
            weightMax: "30", city: "Vilnius", species: "Šuo", ageMin: "1",
            breed: "Test", activity: "high", size: "large", ageMax: "8", weightMin: "5"
        });

        expect(db.query).toHaveBeenCalledWith(
            "SELECT * FROM pets WHERE 1=1 AND species = $1 AND breed = $2 AND size = $3" +
            " AND activity_level = $4 AND city = $5 AND age >= $6 AND age <= $7" +
            " AND weight >= $8 AND weight <= $9",
            ["Šuo", "Test", "large", "high", "Vilnius", 1, 8, 5, 30]
        );
    });

    test("should return all pets without conditions when no filters are given", async () => {
        db.query.mockResolvedValue({ rows: mockPets });

        const result = await getAllAvailablePets();

        expect(db.query).toHaveBeenCalledWith("SELECT * FROM pets WHERE 1=1", []);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("Rikis");
    });

    test("should ignore empty filter values", async () => {
        db.query.mockResolvedValue({ rows: [] });

        await getAllAvailablePets({ species: "", city: undefined, ageMin: 0 });

        expect(db.query).toHaveBeenCalledWith("SELECT * FROM pets WHERE 1=1", []);
    });

});