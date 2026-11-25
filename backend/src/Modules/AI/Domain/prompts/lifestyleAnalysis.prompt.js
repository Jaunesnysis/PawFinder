// 2 funkcija: naudotojo gyvenimo būdo aprašymo analizė

function buildLifestyleAnalysisPrompt(lifestyleText, allowedTags) {
  const systemInstruction = `
Tu esi gyvūnų prieglaudos asistentas, padedantis parinkti gyvūną savanoriui.
Iš naudotojo teksto išskiri tik tai, kas jame aiškiai pasakyta, ir nieko nespėlioji.
Atsakai tik JSON formatu pagal nurodytą struktūrą.
`.trim();

  const prompt = `
Užduotis:
1. Iš naudotojo gyvenimo būdo aprašymo išskirk gyvūno parinkimo kriterijus. Jei kriterijus tekste neminimas, grąžink null.
   - species: "Šuo" arba "Katė", jei naudotojas aiškiai nori konkrečios rūšies
   - size: "small", "medium" arba "large"
   - activityLevel: tinkamas gyvūno aktyvumas pagal naudotojo gyvenimo būdą: "low", "moderate" arba "high"
   - hasChildren: ar namuose yra vaikų (true/false)
   - hasOtherPets: ar namuose yra kitų gyvūnų (true/false)
   - livingSpace: "apartment" (butas) arba "house" (namas)
2. Parink iki 6 žymų, apibūdinančių, kokio charakterio gyvūnas tiktų šiam naudotojui. Žymas rinkis TIK iš leidžiamų žymų sąrašo.

Naudotojo aprašymas:
"""
${lifestyleText}
"""

Leidžiamos žymos: ${allowedTags.join(", ")}

Atsakymo struktūra:
{ "criteria": { "species", "size", "activityLevel", "hasChildren", "hasOtherPets", "livingSpace" }, "tags": string[] }
`.trim();

  return { systemInstruction, prompt };
}

module.exports = { buildLifestyleAnalysisPrompt };
