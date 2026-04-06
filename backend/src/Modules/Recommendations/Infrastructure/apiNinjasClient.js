// Client used for retrieving additional data from ApiNinjas API
const axios = require("axios");

const BASE_URL = "https://api.api-ninjas.com/v1";

async function getDogs(filters) {
  const response = await axios.get(`${BASE_URL}/dogs`, {
    headers: {
      "X-Api-Key": process.env.API_NINJAS_KEY,
    },
    params: filters,
    timeout: 8000,
  });

  return response.data;
}

async function getCats(filters) {
  const response = await axios.get(`${BASE_URL}/cats`, {
    headers: {
      "X-Api-Key": process.env.API_NINJAS_KEY,
    },
    params: filters,
    timeout: 8000,
  });

  return response.data;
}

module.exports = { getDogs, getCats };
