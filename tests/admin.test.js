const request = require('supertest');
const app = require('../app');
const {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
  createUser,
  createAdminUser,
  loginAgent,
} = require('./helpers/setup');

beforeAll(async () => {
  await connectTestDB();
  await clearCollections();
});

beforeEach(async () => {
  await clearCollections();
  await createUser({ email: 'user@example.com', password: 'userpass' });
  await createAdminUser();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe('Admin route protection', () => {

  it('should block unauthenticated users and redirect to /login', async () => {
    const res = await request(app).get('/admin');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  it('should return 403 for a logged-in non-admin user', async () => {
    const agent = await loginAgent(request, app, {
      email: 'user@example.com',
      password: 'userpass',
    });
    const res = await agent.get('/admin');
    expect(res.statusCode).toBe(403);
  });

  it('should allow an admin to update a user status', async () => {
    const targetUser = await createUser({
      email: 'target@example.com',
      password: 'pass123',
    });

    const adminAgent = await loginAgent(request, app, {
      email: 'admin@example.com',
      password: 'adminpass123',
    });

    const res = await adminAgent
      .put(`/api/users/${targetUser._id}/status`)
      .send({ status: 'suspended' });

    expect(res.statusCode).toBe(200);
  });

});

describe('PUT /api/users/:id/status (admin only)', () => {

  it('should block an unauthenticated user', async () => {
    const res = await request(app)
      .put('/api/users/000000000000000000000001/status')
      .send({ status: 'suspended' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  it('should block a logged-in non-admin user', async () => {
    const agent = await loginAgent(request, app, {
      email: 'user@example.com',
      password: 'userpass',
    });
    const res = await agent
      .put('/api/users/000000000000000000000001/status')
      .send({ status: 'suspended' });
    expect([302, 403]).toContain(res.statusCode);
  });

  it('should allow an admin to update a user status', async () => {
    const targetUser = await createUser({
      email: 'target@example.com',
      password: 'pass123',
    });

    const adminAgent = await loginAgent(request, app, {
      email: 'admin@example.com',
      password: 'adminpass123',
    });

    const res = await adminAgent
      .put(`/api/users/${targetUser._id}/status`)
      .send({ status: 'suspended' });

    expect(res.statusCode).toBe(200);
  });

});