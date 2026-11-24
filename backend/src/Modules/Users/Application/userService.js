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

  // PRIDĖTA: shelterId perduodamas į DB kūrimą
  const createdUser = await userRepository.create({
    name: user.name,
    surname: user.surname,
    email: user.email,
    phone: user.phone,
    birthDate: user.birthDate,
    passwordHash,
    shelterId: user.shelter_id,
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
  user.last_earned_at = new Date();
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

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error(
      "JWT_SECRET is not defined. Add JWT_SECRET to backend/.env",
    );
  }

  // expiresIn: '1h' reiškia, kad vartotojas bus atjungtas po valandos
  const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });

  return {
    token: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      points: user.points,
      role: user.role,
      shelterId: user.shelter_id ?? user.shelterId ?? null,
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

const getShelterIdByUserId = async (userId) => {
    return userRepository.getShelterIdByUserId(userId);
};

const formatUserProfile = (user) => ({
  id: user.id,
  name: user.name,
  surname: user.surname,
  email: user.email,
  phone: user.phone,
  birthDate: user.birthDate,
  role: user.role,
  points: user.points,
  shelterId: user.shelter_id ?? user.shelterId ?? null,
});

const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) return null;
  return formatUserProfile(user);
};

const updateProfile = async (userId, rawData) => {
  const existing = await userRepository.findById(userId);
  if (!existing) {
    const err = new Error("Vartotojas nerastas.");
    err.status = 404;
    throw err;
  }

  const newPassword =
    rawData.password && rawData.password.trim() !== ""
      ? rawData.password
      : undefined;

  const candidate = new User({
    ...existing,
    id: userId,
    name: rawData.name,
    surname: rawData.surname,
    email: rawData.email,
    phone: rawData.phone,
    birthDate: rawData.birthDate,
    password: newPassword, // jei tuščias – User.validate() slaptažodžio netikrins
  });

  const validationErrors = candidate.validate();
  if (validationErrors.length > 0) {
    const err = new Error(`Validation failed: ${validationErrors.join(", ")}`);
    err.status = 400;
    throw err;
  }

  const existingByEmail = await userRepository.findByEmail(candidate.email);
  if (existingByEmail && String(existingByEmail.id) !== String(userId)) {
    const err = new Error("Email already exists");
    err.status = 409;
    throw err;
  }

  candidate.name = candidate.name.trim();
  candidate.surname = candidate.surname.trim();
  candidate.email = candidate.email.trim();
  candidate.phone = candidate.phone.trim();
  candidate.password_hash = newPassword
    ? await bcrypt.hash(newPassword, 10)
    : existing.password_hash;

  const updatedRow = await userRepository.update(candidate);
  if (!updatedRow) {
    throw new Error("Nepavyko atnaujinti vartotojo duomenų bazėje.");
  }

  return formatUserProfile(new User(updatedRow));
};

const deleteUser = async (userId) => {
  const deleted = await userRepository.deleteById(userId);
  if (!deleted) {
    const err = new Error("Vartotojas nerastas.");
    err.status = 404;
    throw err;
  }
};

module.exports = {
  registerUser,
  addPointsToUser,
  getUserPoints,
  login,
  getLeaderboard,
  getShelterIdByUserId,
  getUserById,
  updateProfile,
  deleteUser
};
