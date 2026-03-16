const { getAllAvailablePets } = require('../../Infrastructure/petRepository');

describe("Pet filtering tests", () => {

    test("should return only dogs when species filter is applied", async () => {
        const result = await getAllAvailablePets({ species: "Šuo" });

        expect(result.length).toBeGreaterThan(0);
        result.forEach(pet => {
            expect(pet.species).toBe("Šuo");
        });
    });

    test("should return only pets from Vilnius", async () => {
        const result = await getAllAvailablePets({ city: "Vilnius" });

        expect(result.length).toBeGreaterThan(0);
        result.forEach(pet => {
            expect(pet.city).toBe("Vilnius");
        });
    });

    test("should filter pets by minimum age", async () => {
        const result = await getAllAvailablePets({ ageMin: 4 });

        expect(result.length).toBeGreaterThan(0);
        result.forEach(pet => {
            expect(pet.age).toBeGreaterThanOrEqual(4);
        });
    });

});