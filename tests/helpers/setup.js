const mongoose = require('mongoose');
const User = require('../../models/User');
const TransportMode = require('../../models/TransportMode');
const Journey = require('../../models/Journey');
const bcrypt = require('bcrypt');

async function connectTestDB() {
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
  }
}

async function disconnectTestDB() {
  await clearCollections();
}

async function clearCollections() {
  await Promise.all([
    User.deleteMany({}),
    Journey.deleteMany({}),
    TransportMode.deleteMany({}),
  ]);
}

async function createUser({ name = 'Test User', email = 'test@example.com', password = 'password123', role = 'public' } = {}) {
  const passwordHash = await bcrypt.hash(password, 10);
  return User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    accountStatus: 'active',
  });
}

async function createAdminUser() {
  return createUser({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpass123',
    role: 'admin',
  });
}

async function createTransportMode({ name = 'Car', emissionFactor = 0.21, active = true } = {}) {
  return TransportMode.create({ name, emissionFactor, active });
}

async function loginAgent(request, app, { email = 'test@example.com', password = 'password123' } = {}) {
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({ email, password });
  return agent;
}

module.exports = {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
  createUser,
  createAdminUser,
  createTransportMode,
  loginAgent,
};

