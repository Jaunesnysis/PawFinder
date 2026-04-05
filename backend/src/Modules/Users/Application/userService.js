// Modules/Users/Application/userService.js
const userRepository = require("../Infrastructure/userRepository");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../Domain/User");

/**
 * Registruoja naują vartotoją
 */
const registerUser = async (userData) => {
  const user = new User(userData);
  const validationErrors = user.validate();

  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
  }

  const existingUser = await userRepository.findByEmail(user.email);
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(user.password, saltRounds);

  const createdUser = await userRepository.create({
    name: user.name,
    surname: user.surname,
    email: user.email,
    phone: user.phone,
    birthDate: user.birthDate,
    passwordHash,
  });

  return createdUser;
};

/**
 * Prideda taškus vartotojui
 * Naudojamas Achievements modulyje: const updatedUser = await userService.addPointsToUser(...)
 */
const addPointsToUser = async (userId, amount) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error(`Vartotojas su ID ${userId} nerastas.`);
  }

  user.points += amount;

  await userRepository.update(user);
  console.log(
    `[UserService] Vartotojui ${userId} pridėta ${amount} tšk. Viso: ${user.points}`,
  );

  return user;
};

/**
 * Grąžina vartotojo taškų kiekį
 * Naudojamas Achievements modulyje: const currentPoints = await userService.getUserPoints(...)
 */
const getUserPoints = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) return 0;

  return user.points;
};

const login = async (email, password) => {
  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error("Vartotojas su tokiu paštu neegzituoja");

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error("Neteisingas slaptažodis");

  const payload = {
    userId: user.id,
    role: user.role,
  };

  // expiresIn: '1h' reiškia, kad vartotojas bus atjungtas po valandos
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  return {
    token: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      points: user.points,
    },
  };
};

const getLeaderboard = async (limit = 10) => {
  const users = await userRepository.getTopUsersByPoints(limit);
  return users.map((user, index) => ({
    rank: index + 1,
    userId: user.user_id,
    name: user.name,
    surname: user.surname,
    city: user.city || null,
    points: user.points,
    lastEarnedAt: user.last_earned_at || null,
  }));
};

module.exports = {
  registerUser,
  addPointsToUser,
  getUserPoints,
  login,
  getLeaderboard,
};
