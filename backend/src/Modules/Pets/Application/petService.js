const petRepository = require('../Infrastructure/petRepository');

/**
 * Funkcija skirta gauti laisvus augintiniuas pasirinktame mieste
 */
const getAvailablePets = async (city) => {
    // Mes tiesiog paprašome repository, kad jis mums surastų duomenis.
    // Ateityje čia galėtume pridėti papildomų tikrinimų.
    return await petRepository.findAvailableByCity(city);
}

module.exports = { getAvailablePets };