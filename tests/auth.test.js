// tests/auth.test.js
const request = require('supertest');
const app = require('../app');
const {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
  createUser,
} = require('./helpers/setup');

beforeAll(async () => {
  await connectTestDB();
  await clearCollections(); // clean start
});

afterEach(async () => {
  await clearCollections();
});

afterAll(async () => {
  await disconnectTestDB();
});

// ─────────────────────────────────────────────────────────────
// REGISTRATION
// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {

  it('should register a new user and redirect to /journeys/new', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/journeys/new');
  });

  it('should redirect to /register?error=exists on duplicate email', async () => {
    await createUser({ email: 'duplicate@example.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'duplicate@example.com', password: 'password123' });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/register?error=exists');
  });

});

// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {

  // Create the user fresh before EACH login test (afterEach clears it)
  beforeEach(async () => {
    await createUser({ email: 'user@example.com', password: 'correctpass' });
  });

  it('should login successfully and redirect to /journeys/new', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'correctpass' });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/journeys/new');
  });

  it('should redirect to /login?error=invalid on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login?error=invalid');
  });

  it('should redirect to /login?error=notfound for unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login?error=notfound');
  });

  it('should redirect to /login?error=missing when fields are empty', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '', password: '' });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login?error=missing');
  });

});