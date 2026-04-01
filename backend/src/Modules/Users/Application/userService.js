const bcrypt = require('bcrypt');
const User = require('../Domain/User');
const userRepository = require('../Infrastructure/userRepository');

// Temporary mock users still needed by Achievements module
const mockUsers = [
    { user_id: 1, name: "DeivM", points: 20 }
];

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
 * Temporary mock logic for Achievements module
 */
const addPointsToUser = async (userId, amount) => {
    let user = mockUsers.find(u => u.user_id === parseInt(userId));

    if (!user) {
        user = { user_id: parseInt(userId), name: "Naujas Vartotojas", points: 0 };
        mockUsers.push(user);
    }

    user.points += amount;

    console.log(`[UserService Mock] Vartotojui ${userId} pridėta ${amount} tšk. Viso: ${user.points}`);
    return user;
};

/**
 * Temporary mock logic for Achievements module
 */
const getUserPoints = async (userId) => {
    const user = mockUsers.find(u => u.user_id === parseInt(userId));
    if (!user) return 0;
    return user.points;
};

module.exports = {
    registerUser,
    addPointsToUser,
    getUserPoints
};