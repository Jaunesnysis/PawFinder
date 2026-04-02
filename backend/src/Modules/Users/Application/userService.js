// Modules/Users/Application/userService.js
//Cia tik mock duomenys, kurie reikalingi achievement servisui
const userRepository = require("../Infrastructure/userRepository");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

const login = async (email, password) => {

    const user = await userRepository.findByEmail(email);
    if(!user) throw new Error("Vartotojas su tokiu paštu neegzituoja")

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if(!isMatch) throw new Error("Neteisingas slaptažodis");

    const payload = {
        userId: user.id,
        role: user.role
    };

    // expiresIn: '1h' reiškia, kad vartotojas bus atjungtas po valandos
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return {
        token: token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            points: user.points
        }
    };
}

module.exports = {
    addPointsToUser,
    getUserPoints,
    login
};