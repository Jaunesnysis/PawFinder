// Modules/Users/Application/userService.js
//Cia tik mock duomenys, kurie reikalingi achievement servisui
const userRepository = require("../Infrastructure/userRepository");

/**
 * Prideda taškus vartotojui
 * Naudojamas Achievements modulyje: const updatedUser = await userService.addPointsToUser(...)
 */
const addPointsToUser = async (userId, amount) => {
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new Error(`Vartotojas su ID ${userId} nerastas.`);
    }

    user.points+=amount;

    await userRepository.update(user);
    console.log(`[UserService] Vartotojui ${userId} pridėta ${amount} tšk. Viso: ${user.points}`);

    return user;
};

/**
 * Grąžina vartotojo taškų kiekį
 * Naudojamas Achievements modulyje: const currentPoints = await userService.getUserPoints(...)
 */
const getUserPoints = async (userId) => {
    const user = await userRepository.findById(userId)

    if (!user) return 0;

    return user.points;
};

module.exports = {
    addPointsToUser,
    getUserPoints
};