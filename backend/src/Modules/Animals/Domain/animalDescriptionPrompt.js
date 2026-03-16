// Prompt template used for generating animal descriptions
function buildAnimalDescriptionPrompt(animal) {
  return `
Tu esi gyvūnų prieglaudos turinio redaktorius.

Sugeneruok profesionalų, šiltą ir aiškų gyvūno aprašymą LIETUVIŲ kalba.
Nerašyk išgalvotų faktų. Remkis tik pateikta informacija.
Jei kažkokios informacijos trūksta, jos neišgalvok.
Tekstas turi būti 80–140 žodžių.
Pabaigoje pridėk trumpą, šiltą kvietimą susipažinti su augintiniu.

Gyvūno duomenys:
- Vardas: ${animal.name || "Nenurodyta"}
- Rūšis: ${animal.species || "Nenurodyta"}
- Veislė: ${animal.breed || "Nenurodyta"}
- Amžius: ${animal.age || "Nenurodyta"}
- Svoris: ${animal.weight || "Nenurodyta"}
- Sveikatos būklė: ${animal.healthStatus || "Nenurodyta"}
- Papildomas prieglaudos aprašymas: ${animal.notes || "Nenurodyta"}

Atsakyk tik LIETUVIŲ kalba.
`;
}

module.exports = { buildAnimalDescriptionPrompt };
