// tests/journey.test.js
const request = require('supertest');
const app = require('../app');
const {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
  createUser,
  createTransportMode,
  loginAgent,
} = require('./helpers/setup');

let agent;
let mode;

beforeAll(async () => {
  await connectTestDB();
  await clearCollections();
});

beforeEach(async () => {
  await clearCollections();

  // Recreate user + mode + agent fresh for every test
  await createUser({ email: 'traveller@example.com', password: 'pass123' });
  mode = await createTransportMode({ name: 'Car', emissionFactor: 0.21 });

  // Log in and get a session-aware agent
  agent = await loginAgent(request, app, { email: 'traveller@example.com', password: 'pass123' });
});

afterAll(async () => {
  await disconnectTestDB();
});

// ─────────────────────────────────────────────────────────────
// JOURNEY CREATION & EMISSIONS CALCULATION
// ─────────────────────────────────────────────────────────────
describe('POST /api/journeys', () => {

  it('should create a journey and redirect to /journeys', async () => {
    const res = await agent
      .post('/api/journeys')
      .send({
        modeId: mode._id.toString(),
        distanceKm: '100',
        origin: 'London',
        destination: 'Manchester',
      });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/journeys');
  });

  it('should calculate emissions correctly (distance × emissionFactor)', async () => {
    await agent
      .post('/api/journeys')
      .send({
        modeId: mode._id.toString(),
        distanceKm: '100',
        origin: 'London',
        destination: 'Manchester',
      });

    const res = await agent.get('/api/journeys');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const journey = res.body.data[0];
    expect(journey.distanceKm).toBe(100);
    expect(journey.emissionFactorUsed).toBe(0.21);
    // 100km × 0.21 = 21.0 kg CO2
    expect(journey.estimatedEmissions).toBeCloseTo(21.0, 5);
  });

  // ─── Validation ───────────────────────────────────────────
  it('should redirect back on missing fields', async () => {
    const res = await agent
      .post('/api/journeys')
      .send({});

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/journeys/new');
  });

  it('should redirect back on invalid distance (negative number)', async () => {
    const res = await agent
      .post('/api/journeys')
      .send({
        modeId: mode._id.toString(),
        distanceKm: '-50',
        origin: 'London',
        destination: 'Manchester',
      });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/journeys/new');
  });

  it('should redirect back on invalid distance (zero)', async () => {
    const res = await agent
      .post('/api/journeys')
      .send({
        modeId: mode._id.toString(),
        distanceKm: '0',
        origin: 'London',
        destination: 'Manchester',
      });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/journeys/new');
  });

  it('should redirect back on non-numeric distance', async () => {
    const res = await agent
      .post('/api/journeys')
      .send({
        modeId: mode._id.toString(),
        distanceKm: 'abc',
        origin: 'London',
        destination: 'Manchester',
      });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/journeys/new');
  });

  it('should redirect back on missing origin', async () => {
    const res = await agent
      .post('/api/journeys')
      .send({
        modeId: mode._id.toString(),
        distanceKm: '100',
        destination: 'Manchester',
      });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/journeys/new');
  });

  // ─── Auth protection ──────────────────────────────────────
  it('should redirect unauthenticated users to /login', async () => {
    const res = await request(app)
      .post('/api/journeys')
      .send({
        modeId: mode._id.toString(),
        distanceKm: '100',
        origin: 'London',
        destination: 'Manchester',
      });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

});

// ─────────────────────────────────────────────────────────────
// GET /api/journeys
// ─────────────────────────────────────────────────────────────
describe('GET /api/journeys', () => {

  it('should return only the logged-in user journeys', async () => {
    await agent.post('/api/journeys').send({
      modeId: mode._id.toString(),
      distanceKm: '50',
      origin: 'Bristol',
      destination: 'Bath',
    });

    const res = await agent.get('/api/journeys');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].origin).toBe('Bristol');
  });

  it('should redirect unauthenticated users to /login', async () => {
    const res = await request(app).get('/api/journeys');

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

});

// ─────────────────────────────────────────────────────────────
// JOURNEY CREATION & EMISSIONS CALCULATION
// ─────────────────────────────────────────────────────────────
describe('POST /api/journeys', () => {

  it('should create a journey and redirect to /journeys', async () => {
    const res = await agent
      .post('/api/journeys')
      .send({
        modeId: mode._id.toString(),
        distanceKm: '100',
        origin: 'London',
        destination: 'Manchester',
      });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/journeys');
  });

  it('should calculate emissions correctly (distance × emissionFactor)', async () => {
    // Create journey
    await agent
      .post('/api/journeys')
      .send({
        modeId: mode._id.toString(),
        distanceKm: '100',
        origin: 'London',
        destination: 'Manchester',
      });

    // Fetch journeys and verify the calculation
    const res = await agent.get('/api/journeys');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const journey = res.body.data[0];
    expect(journey.distanceKm).toBe(100);
    expect(journey.emissionFactorUsed).toBe(0.21);
    // 100km × 0.21 = 21.0 kg CO2
    expect(journey.estimatedEmissions).toBeCloseTo(21.0, 5);
  });

  // ─── Validation ───────────────────────────────────────────
  it('should redirect back on missing fields', async () => {
    const res = await agent
      .post('/api/journeys')
      .send({}); // no fields at all

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/journeys/new');
  });

  it('should redirect back on invalid distance (negative number)', async () => {
    const res = await agent
      .post('/api/journeys')
      .send({
        modeId: mode._id.toString(),
        distanceKm: '-50',
        origin: 'London',
        destination: 'Manchester',
      });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/journeys/new');
  });

  it('should redirect back on invalid distance (zero)', async () => {
    const res = await agent
      .post('/api/journeys')
      .send({
        modeId: mode._id.toString(),
        distanceKm: '0',
        origin: 'London',
        destination: 'Manchester',
      });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/journeys/new');
  });

  it('should redirect back on non-numeric distance', async () => {
    const res = await agent
      .post('/api/journeys')
      .send({
        modeId: mode._id.toString(),
        distanceKm: 'abc',
        origin: 'London',
        destination: 'Manchester',
      });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/journeys/new');
  });

  it('should redirect back on missing origin', async () => {
    const res = await agent
      .post('/api/journeys')
      .send({
        modeId: mode._id.toString(),
        distanceKm: '100',
        destination: 'Manchester',
        // origin missing
      });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/journeys/new');
  });

  // ─── Auth protection ──────────────────────────────────────
  it('should redirect unauthenticated users to /login', async () => {
    const res = await request(app) // no agent = no session
      .post('/api/journeys')
      .send({
        modeId: mode._id.toString(),
        distanceKm: '100',
        origin: 'London',
        destination: 'Manchester',
      });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

});

// ─────────────────────────────────────────────────────────────
// GET /api/journeys
// ─────────────────────────────────────────────────────────────
describe('GET /api/journeys', () => {

  it('should return only the logged-in user journeys', async () => {
    // Create a journey first
    await agent.post('/api/journeys').send({
      modeId: mode._id.toString(),
      distanceKm: '50',
      origin: 'Bristol',
      destination: 'Bath',
    });

    const res = await agent.get('/api/journeys');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].origin).toBe('Bristol');
  });

  it('should redirect unauthenticated users to /login', async () => {
    const res = await request(app).get('/api/journeys');

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

});
