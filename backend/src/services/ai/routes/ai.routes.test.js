/* global jest, describe, test, expect */
const request = require('supertest');

jest.mock('../../../middlewares/auth', () => {
  const auth = (req, _res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
  };
  auth.authorize = () => (_req, _res, next) => next();
  return auth;
});

jest.mock('../evidence.service', () => ({
  buildEvidence: jest.fn(async () => ({
    evidence: [{ title: 'Mock evidence', details: 'Sales up 12%' }],
    contextSummary: 'Mock evidence summary',
    actionSuggestions: [{ label: 'Open sales dashboard', route: '/sales' }],
    dataQuery: true
  }))
}));

jest.mock('../ai.service', () => ({
  askAI: jest.fn(async () => 'Mock AI response')
}));

const app = require('../../../app');

describe('AI route', () => {
  test('returns 400 when message is missing', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('returns explainable response for valid message', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'Show sales summary' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reply).toBeDefined();
    expect(res.body.mode).toBe('explainable');
    expect(Array.isArray(res.body.evidence)).toBe(true);
  });
});
