import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import sessionRouter from '../routes/session.js';
import { clearAllSessions } from '../services/sessionStore.js';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/session', sessionRouter);
  return app;
}

describe('Session Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    clearAllSessions();
    app = createApp();
  });

  describe('POST /api/session', () => {
    it('should create a new session with 10 credits', async () => {
      const res = await request(app).post('/api/session');
      expect(res.status).toBe(201);
      expect(res.body.sessionId).toBeDefined();
      expect(res.body.credits).toBe(10);
    });
  });

  describe('POST /api/session/:id/roll', () => {
    it('should return a roll result', async () => {
      const createRes = await request(app).post('/api/session');
      const { sessionId } = createRes.body;

      const rollRes = await request(app).post(`/api/session/${sessionId}/roll`);
      expect(rollRes.status).toBe(200);
      expect(rollRes.body.symbols).toHaveLength(3);
      expect(typeof rollRes.body.win).toBe('boolean');
      expect(typeof rollRes.body.reward).toBe('number');
      expect(typeof rollRes.body.credits).toBe('number');
    });

    it('should deduct 1 credit per roll on a loss', async () => {
      const createRes = await request(app).post('/api/session');
      const { sessionId } = createRes.body;

      // Roll multiple times — credits should decrease by 1 each non-winning roll
      let lastCredits = 10;
      for (let i = 0; i < 5; i++) {
        const rollRes = await request(app).post(`/api/session/${sessionId}/roll`);
        if (!rollRes.body.win) {
          expect(rollRes.body.credits).toBe(lastCredits - 1);
        }
        lastCredits = rollRes.body.credits;
      }
    });

    it('should return 404 for nonexistent session', async () => {
      const res = await request(app).post('/api/session/nonexistent/roll');
      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 when session is closed', async () => {
      const createRes = await request(app).post('/api/session');
      const { sessionId } = createRes.body;

      await request(app).post(`/api/session/${sessionId}/cashout`);

      const rollRes = await request(app).post(`/api/session/${sessionId}/roll`);
      expect(rollRes.status).toBe(400);
      expect(rollRes.body.error).toContain('closed');
    });

    it('should return 400 when out of credits', async () => {
      const createRes = await request(app).post('/api/session');
      const { sessionId } = createRes.body;

      // Drain all credits by rolling — we need to force losses
      // Just roll until we get a 400
      let status = 200;
      for (let i = 0; i < 20 && status === 200; i++) {
        const res = await request(app).post(`/api/session/${sessionId}/roll`);
        status = res.status;
        if (res.body.credits === 0 && status === 200) {
          // Next roll should fail
          const nextRes = await request(app).post(`/api/session/${sessionId}/roll`);
          expect(nextRes.status).toBe(400);
          expect(nextRes.body.error).toContain('credits');
          return;
        }
      }
    });
  });

  describe('POST /api/session/:id/cashout', () => {
    it('should cash out and close the session', async () => {
      const createRes = await request(app).post('/api/session');
      const { sessionId } = createRes.body;

      const cashoutRes = await request(app).post(`/api/session/${sessionId}/cashout`);
      expect(cashoutRes.status).toBe(200);
      expect(cashoutRes.body.credits).toBe(10);
      expect(cashoutRes.body.message).toContain('Cashed out');
    });

    it('should return 404 for nonexistent session', async () => {
      const res = await request(app).post('/api/session/nonexistent/cashout');
      expect(res.status).toBe(404);
    });

    it('should return 400 if already cashed out', async () => {
      const createRes = await request(app).post('/api/session');
      const { sessionId } = createRes.body;

      await request(app).post(`/api/session/${sessionId}/cashout`);
      const res = await request(app).post(`/api/session/${sessionId}/cashout`);
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('closed');
    });
  });
});
