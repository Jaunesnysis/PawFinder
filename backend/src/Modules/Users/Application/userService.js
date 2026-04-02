const bcrypt = require('bcrypt');
const User = require('../Domain/User');
const userRepository = require('../Infrastructure/userRepository');

/**
 * Registruoja naują vartotoją
 */
const registerUser = async (userData) => {
    const user = new User(userData);
    const validationErrors = user.validate();

    if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const existingUser = await userRepository.findByEmail(user.email);
    if (existingUser) {
        throw new Error('Email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(user.password, saltRounds);

    const createdUser = await userRepository.create({
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate,
        passwordHash
    });

    return createdUser;
};

/**
 * Prideda taškus vartotojui
 * Naudojamas Achievements modulyje
 */
const addPointsToUser = async (userId, amount) => {
    const user = await userRepository.findById(userId);

    if (!user) {
        throw new Error(`Vartotojas su ID ${userId} nerastas.`);
    }

    user.points += amount;

    await userRepository.update(user);
    console.log(`[UserService] Vartotojui ${userId} pridėta ${amount} tšk. Viso: ${user.points}`);

    return user;
};

/**
 * Grąžina vartotojo taškų kiekį
 * Naudojamas Achievements modulyje
 */
const getUserPoints = async (userId) => {
    const user = await userRepository.findById(userId);

    if (!user) return 0;

    return user.points;
};

module.exports = {
    registerUser,
    addPointsToUser,
    getUserPoints
};