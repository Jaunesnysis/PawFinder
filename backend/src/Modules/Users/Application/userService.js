// Modules/Users/Application/userService.js
//Cia tik mock duomenys, kurie reikalingi achievement servisui
/**
 * LAIKINAS MOCK SERVISAS
 * Kol kolega nebaigė Users modulio, naudojame šį pakaitalą.
 */

// Imituojame vartotojų duomenų bazę
const mockUsers = [
    { user_id: 1, name: "DeivM", points: 0 }
];

/**
 * Prideda taškus vartotojui
 * Naudojamas Achievements modulyje: const updatedUser = await userService.addPointsToUser(...)
 */
const addPointsToUser = async (userId, amount) => {
    let user = mockUsers.find(u => u.user_id === parseInt(userId));

    // Jei vartotojo nėra, laikinai jį sukuriam (kad testai nesustotų)
    if (!user) {
        user = { user_id: parseInt(userId), name: "Naujas Vartotojas", points: 0 };
        mockUsers.push(user);
    }

    user.points += amount;

    console.log(`[UserService Mock] Vartotojui ${userId} pridėta ${amount} tšk. Viso: ${user.points}`);

    // Grąžiname vartotojo objektą, kaip tikisi AchievementService
    return user;
};

/**
 * Grąžina vartotojo taškų kiekį
 * Naudojamas Achievements modulyje: const currentPoints = await userService.getUserPoints(...)
 */
const getUserPoints = async (userId) => {
    const user = mockUsers.find(u => u.user_id === parseInt(userId));

    if (!user) return 0;

    return user.points;
};

module.exports = {
    addPointsToUser,
    getUserPoints
};