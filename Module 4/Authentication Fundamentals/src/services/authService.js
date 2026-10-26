const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { AppError } = require('../errors');

const COST_FACTOR = Number(process.env.BCRYPT_COST || 12);
const DUMMY_HASH = bcrypt.hash(
  crypto.randomBytes(32).toString('hex'),
  COST_FACTOR
);

function invalidInput() {
  return new AppError(400, 'INVALID_REQUEST', 'Required fields must be non-empty strings');
}

function invalidCredentials() {
  return new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
}

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function getRequiredString(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw invalidInput();
  }
  return value;
}

function getObjectBody(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw invalidInput();
  }
  return body;
}

async function register(body) {
  const input = getObjectBody(body);
  const name = getRequiredString(input.name).trim();
  const email = getRequiredString(input.email).trim().toLowerCase();
  const password = getRequiredString(input.password);

  if (await userRepository.findByEmail(email)) {
    throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, COST_FACTOR);
  try {
    const user = await userRepository.create({ name, email, passwordHash });
    return safeUser(user);
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
    }
    throw error;
  }
}

async function login(body) {
  const input = getObjectBody(body);
  const email = getRequiredString(input.email).trim().toLowerCase();
  const password = getRequiredString(input.password);
  const user = await userRepository.findByEmail(email);

  if (!user) {
    await bcrypt.compare(password, await DUMMY_HASH);
    throw invalidCredentials();
  }

  if (!(await bcrypt.compare(password, user.passwordHash))) {
    throw invalidCredentials();
  }

  return safeUser(user);
}

module.exports = { register, login };
