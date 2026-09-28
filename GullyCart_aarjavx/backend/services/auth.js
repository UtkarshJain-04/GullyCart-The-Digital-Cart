require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userRepository } = require('../repositories');

const SALT_ROUNDS = 12;

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return process.env.JWT_SECRET;
}

function createAccessToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    getJwtSecret(),
    { expiresIn: '1h' }
  );
}

function sanitizeUser(user) {
  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.passwordHash;
  return userObject;
}

async function registerUser({ name, phone, email, password, role = 'user' }) {
  if (!name || !phone || !password) {
    throw new Error('Name, phone, and password are required.');
  }

  if (!['user', 'vendor', 'admin'].includes(role)) {
    throw new Error('Invalid user role.');
  }

  const normalizedEmail = email?.trim().toLowerCase() || undefined;
  const normalizedPhone = phone.trim();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({
    name,
    phone: normalizedPhone,
    email: normalizedEmail,
    passwordHash,
    role,
  });

  return {
    user: sanitizeUser(user),
    token: createAccessToken(user),
  };
}

async function loginUser({ email, phone, password }) {
  const identifier = email || phone;
  if (!identifier || !password) {
    throw new Error('Phone or email and password are required.');
  }

  const user = email
    ? await userRepository.findByEmail(email)
    : await userRepository.findByPhone(phone);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error('Invalid email or password.');
  }

  return {
    user: sanitizeUser(user),
    token: createAccessToken(user),
  };
}

module.exports = {
  createAccessToken,
  registerUser,
  loginUser,
};