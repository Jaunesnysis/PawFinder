const lifestyleRepository = require("../Infrastructure/lifestyleRepository");
const { LifestyleDescription } = require("../Domain/LifestyleDescription");
const { Pet } = require("../../Animals/Domain/Pet");

// Prieglaudos gyvenimo būdo aprašymo nepildo
const assertCanUseLifestyle = (user) => {
  if (!user || !user.id) {
    throw { status: 401, message: "Prisijunkite, kad galėtumėte tęsti." };
  }
  if (user.role === "shelter") {
    throw {
      status: 403,
      message: "Gyvenimo būdo aprašymas skirtas tik savanoriams.",
    };
  }
};

/**
 * Grąžina vartotojo aprašymą ir jam priskirtus tagus (user_tag)
 */
const getLifestyle = async (user) => {
  assertCanUseLifestyle(user);

  const row = await lifestyleRepository.findDescriptionByUserId(user.id);
  if (!row) throw { status: 404, message: "Vartotojas nerastas." };

  const tags = await lifestyleRepository.findTagNamesByUserId(user.id);

  return {
    description: row.life_description || null,
    tags,
  };
};

/**
 * Išsaugo gyvenimo būdo aprašymą (AC2.2).
 * Sutikimas tikrinamas kiekvieną kartą, bet DB nesaugomas.
 * AC2.3 (DI tagų generavimas) bus realizuota vėliau.
 */
const saveLifestyle = async (user, { description, consent } = {}) => {
  assertCanUseLifestyle(user);

  const lifestyle = new LifestyleDescription(description);
  const errors = lifestyle.validate();
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(" ") };
  }

  if (consent !== true) {
    throw {
      status: 400,
      message: "Pažymėkite sutikimą, kad aprašymas būtų perduotas DI paslaugai.",
    };
  }

  const row = await lifestyleRepository.saveDescription(user.id, lifestyle.text);
  if (!row) throw { status: 404, message: "Vartotojas nerastas." };

  const tags = await lifestyleRepository.findTagNamesByUserId(user.id);

  return {
    description: row.life_description,
    tags,
  };
};

/**
 * Gyvūnai pagal bendrus vartotojo ir gyvūno tagus (user_tag ↔ pet_tag)
 */
const getSuggestedPets = async (user) => {
  assertCanUseLifestyle(user);

  const rows = await lifestyleRepository.findSuggestedPets(user.id);
  return rows.map((row) => ({
    ...new Pet(row),
    matched_tags: row.matched_tags,
  }));
};

module.exports = { getLifestyle, saveLifestyle, getSuggestedPets };
