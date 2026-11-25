// 1 funkcija: gyvūno aprašymo ir žymų generavimas

const value = (v) => (v === null || v === undefined || v === "" ? "Nenurodyta" : v);

const SIZE_LT = { small: "mažas", medium: "vidutinis", large: "didelis" };
const ACTIVITY_LT = { low: "žemas", moderate: "vidutinis", high: "aukštas" };

function buildAnimalProfilePrompt(pet, allowedTags) {
  const systemInstruction = `
Tu esi gyvūnų prieglaudos turinio redaktorius.
Rašai tik LIETUVIŲ kalba.
Remiesi tik pateiktais duomenimis ir nieko neišgalvoji.
Atsakai tik JSON formatu pagal nurodytą struktūrą.
`.trim();

  const prompt = `
Užduotis:
1. Parašyk šiltą, aiškų gyvūno aprašymą (80–140 žodžių). Pabaigoje pridėk trumpą kvietimą susipažinti su gyvūnu.
2. Parink iki 6 žymų, kurios geriausiai apibūdina gyvūno charakterį ir energiją. Žymas rinkis TIK iš leidžiamų žymų sąrašo. Jei duomenų žymai pagrįsti nepakanka, jos nepridėk.

Gyvūno duomenys:
- Vardas: ${value(pet.name)}
- Rūšis: ${value(pet.species)}
- Veislė: ${value(pet.breed)}
- Amžius (metais): ${value(pet.age)}
- Dydis: ${value(SIZE_LT[pet.size] || pet.size)}
- Svoris (kg): ${value(pet.weight)}
- Aktyvumo lygis: ${value(ACTIVITY_LT[pet.activity_level] || pet.activity_level)}
- Sveikatos informacija: ${value(pet.health_info)}
- Prieglaudos darbuotojo aprašymas: ${value(pet.shelter_description)}

Leidžiamos žymos: ${allowedTags.join(", ")}

Atsakymo struktūra: { "description": string, "tags": string[] }
`.trim();

  return { systemInstruction, prompt };
}

module.exports = { buildAnimalProfilePrompt };
