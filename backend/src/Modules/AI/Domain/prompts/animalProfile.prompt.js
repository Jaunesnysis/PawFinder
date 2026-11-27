// 1 funkcija: gyvūno aprašymo ir žymų generavimas.
// Jei perduoti pet.walk_observations (3 funkcijos rezultatas), aprašymas atnaujinamas
// remiantis dabartiniu DI aprašymu ir naujais savanorio pastebėjimais.

const value = (v) =>
  v === null || v === undefined || v === "" ? "Nenurodyta" : v;

const SIZE_LT = { small: "mažas", medium: "vidutinis", large: "didelis" };
const ACTIVITY_LT = { low: "žemas", moderate: "vidutinis", high: "aukštas" };

function buildAnimalProfilePrompt(pet, allowedTags) {
  const observations = Array.isArray(pet.walk_observations)
    ? pet.walk_observations
    : [];
  const isFeedbackUpdate = observations.length > 0;

  const systemInstruction = `
Tu esi gyvūnų prieglaudos turinio redaktorius.
Rašai tik LIETUVIŲ kalba.
Remiesi tik pateiktais duomenimis ir nieko neišgalvoji.
Atsakai tik JSON formatu pagal nurodytą struktūrą.
`.trim();

  const feedbackTask = isFeedbackUpdate
    ? `
Svarbu: tai esamo aprašymo atnaujinimas. Išlaikyk dabartinio DI aprašymo informaciją ir natūraliai įtrauk naujus savanorio pastebėjimus po pavedžiojimo. Jei pastebėjimas prieštarauja seniems duomenims, remkis naujausiu pastebėjimu.`
    : "";

  const feedbackData = isFeedbackUpdate
    ? `
- Dabartinis DI aprašymas: ${value(pet.ai_description)}
- Nauji savanorio pastebėjimai po pavedžiojimo:
${observations.map((o) => `  * ${o}`).join("\n")}`
    : "";

  const prompt = `
Užduotis:
1. Parašyk šiltą, aiškų gyvūno aprašymą (80–140 žodžių). Pabaigoje pridėk trumpą kvietimą susipažinti su gyvūnu.
2. Parink iki 6 žymų, kurios geriausiai apibūdina gyvūno charakterį ir energiją. Žymas rinkis TIK iš leidžiamų žymų sąrašo. Jei duomenų žymai pagrįsti nepakanka, jos nepridėk.${feedbackTask}

Gyvūno duomenys:
- Vardas: ${value(pet.name)}
- Rūšis: ${value(pet.species)}
- Veislė: ${value(pet.breed)}
- Amžius (metais): ${value(pet.age)}
- Dydis: ${value(SIZE_LT[pet.size] || pet.size)}
- Svoris (kg): ${value(pet.weight)}
- Aktyvumo lygis: ${value(ACTIVITY_LT[pet.activity_level] || pet.activity_level)}
- Sveikatos informacija: ${value(pet.health_info)}
- Prieglaudos darbuotojo aprašymas: ${value(pet.shelter_description)}${feedbackData}

Leidžiamos žymos: ${allowedTags.join(", ")}

Atsakymo struktūra: { "description": string, "tags": string[] }
`.trim();

  return { systemInstruction, prompt };
}

module.exports = { buildAnimalProfilePrompt };
