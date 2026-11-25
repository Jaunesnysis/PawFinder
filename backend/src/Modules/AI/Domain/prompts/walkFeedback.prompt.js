// 3 funkcija: atsiliepimo po pavedžiojimo analizė

const value = (v) => (v === null || v === undefined || v === "" ? "Nenurodyta" : v);

function buildWalkFeedbackPrompt({ feedback, pet }, allowedTags) {
  const systemInstruction = `
Tu esi gyvūnų prieglaudos asistentas.
Iš savanorio atsiliepimo po pavedžiojimo išskiri pastebėjimus apie gyvūno elgesį.
Rašai tik LIETUVIŲ kalba, remiesi tik atsiliepimu ir nieko neišgalvoji.
Atsakai tik JSON formatu pagal nurodytą struktūrą.
`.trim();

  const prompt = `
Užduotis:
1. Išskirk iki 5 trumpų, faktinių pastebėjimų apie gyvūno elgesį (pvz. kaip reagavo į kitus šunis, žmones, triukšmą, kaip ėjo su pavadėliu). Neįtrauk savanorio emocijų ar informacijos, nesusijusios su gyvūnu.
2. Pasiūlyk iki 6 žymų, kurias atsiliepimas aiškiai pagrindžia. Žymas rinkis TIK iš leidžiamų žymų sąrašo.

Gyvūno kontekstas:
- Vardas: ${value(pet.name)}
- Rūšis: ${value(pet.species)}
- Dabartinis aprašymas: ${value(pet.ai_description || pet.shelter_description)}
- Dabartinės žymos: ${pet.tags && pet.tags.length ? pet.tags.join(", ") : "Nėra"}

Savanorio atsiliepimas:
"""
${feedback}
"""

Leidžiamos žymos: ${allowedTags.join(", ")}

Atsakymo struktūra: { "observations": string[], "suggestedTags": string[] }
`.trim();

  return { systemInstruction, prompt };
}

module.exports = { buildWalkFeedbackPrompt };
