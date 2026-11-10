const {
  LifestyleDescription,
  MIN_LENGTH,
  MAX_LENGTH,
} = require("../LifestyleDescription");

describe("LifestyleDescription (US-02 AC2.2)", () => {
  test("tuščias aprašymas yra neleidžiamas", () => {
    expect(new LifestyleDescription("").validate()).toHaveLength(1);
    expect(new LifestyleDescription(undefined).validate()).toHaveLength(1);
  });

  test("vien tarpai laikomi tuščiu aprašymu", () => {
    const errors = new LifestyleDescription("   \n\t  ").validate();
    expect(errors[0]).toMatch(/tuščias/);
  });

  test(`${MIN_LENGTH - 1} simbolių yra per mažai`, () => {
    const errors = new LifestyleDescription("a".repeat(MIN_LENGTH - 1)).validate();
    expect(errors[0]).toMatch(/per trumpas/);
  });

  test(`${MIN_LENGTH} ir ${MAX_LENGTH} simbolių ribos yra leidžiamos`, () => {
    expect(new LifestyleDescription("a".repeat(MIN_LENGTH)).validate()).toEqual([]);
    expect(new LifestyleDescription("a".repeat(MAX_LENGTH)).validate()).toEqual([]);
  });

  test(`${MAX_LENGTH + 1} simbolių yra per daug`, () => {
    const errors = new LifestyleDescription("a".repeat(MAX_LENGTH + 1)).validate();
    expect(errors[0]).toMatch(/per ilgas/);
  });

  test("kraštiniai tarpai neįskaičiuojami į ilgį", () => {
    const text = `   ${"a".repeat(MIN_LENGTH - 1)}   `;
    expect(new LifestyleDescription(text).validate()[0]).toMatch(/per trumpas/);
  });

  test("lietuviškos raidės ir emoji skaičiuojami kaip vienas simbolis", () => {
    expect(new LifestyleDescription("ąčęėįšųūž").length).toBe(9);
    expect(new LifestyleDescription("🐶🐱").length).toBe(2);
  });
});
