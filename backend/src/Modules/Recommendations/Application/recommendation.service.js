// Service responsible for generating recommendations based on questionnaire answers
const { getDogs, getCats } = require("../Infrastructure/apiNinjasClient");

async function getRecommendations(data) {
  const { petType, ...filters } = data;

  let result;

  if (petType === "dog") {
    result = await getDogs(filters);
  } else if (petType === "cat") {
    result = await getCats(filters);
  } else {
    throw new Error("Invalid pet type");
  }

  return result;
}

module.exports = { getRecommendations };
