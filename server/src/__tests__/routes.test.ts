import 'reflect-metadata';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { DataSource } from 'typeorm';
import { Session } from '../entities/Session.js';
import { setDataSource } from '../database.js';
import { sessionMiddleware } from '../sessionConfig.js';
import sessionRouter from '../routes/session.js';
import { clearAllSessions, getPersistedSession } from '../services/sessionStore.js';

let testDataSource: DataSource;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(sessionMiddleware);
  app.use('/api/session', sessionRouter);
  return app;
}

beforeAll(async () => {
  testDataSource = new DataSource({
    type: 'better-sqlite3',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [Session],
  });
  await testDataSource.initialize();
  setDataSource(testDataSource);
});

afterAll(async () => {
  if (testDataSource?.isInitialized) {
    await testDataSource.destroy();
  }
});

describe('Session Routes', () => {
  let app: express.Express;

  beforeEach(async () => {
    await clearAllSessions();
    app = createApp();
  });

  describe('POST /api/session', () => {
    it('should create a new session with 10 credits', async () => {
      const res = await request(app).post('/api/session').send({ playerId: 'test-player' });
      expect(res.status).toBe(201);
      expect(res.body.sessionId).toBeDefined();
      expect(res.body.credits).toBe(10);
      expect(res.body.playerId).toBe('test-player');
    });

    it('should not allow creating a second session while one is active', async () => {
      const agent = request.agent(app);

      const res1 = await agent.post('/api/session').send({ playerId: 'test-player' });
      expect(res1.status).toBe(201);

      const res2 = await agent.post('/api/session').send({ playerId: 'test-player' });
      expect(res2.status).toBe(400);
      expect(res2.body.error).toContain('already has an active game');
    });
  });

  describe('POST /api/session/roll', () => {
    it('should return a roll result', async () => {
      const agent = request.agent(app);
      await agent.post('/api/session');

      const rollRes = await agent.post('/api/session/roll');
      expect(rollRes.status).toBe(200);
      expect(rollRes.body.symbols).toHaveLength(3);
      expect(typeof rollRes.body.win).toBe('boolean');
      expect(typeof rollRes.body.reward).toBe('number');
      expect(typeof rollRes.body.credits).toBe('number');
    });

    it('should deduct 1 credit per roll on a loss', async () => {
      const agent = request.agent(app);
      await agent.post('/api/session');

      // Roll multiple times — credits should decrease by 1 each non-winning roll
      let lastCredits = 10;
      for (let i = 0; i < 5; i++) {
        const rollRes = await agent.post('/api/session/roll');
        if (!rollRes.body.win) {
          expect(rollRes.body.credits).toBe(lastCredits - 1);
        }
        lastCredits = rollRes.body.credits;
      }
    });

    it('should return 404 when no session exists', async () => {
      const res = await request(app).post('/api/session/roll');
      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 when session is closed', async () => {
      const agent = request.agent(app);
      await agent.post('/api/session');
      await agent.post('/api/session/cashout');

      // After cashout, session is destroyed, so this should be 404
      const rollRes = await agent.post('/api/session/roll');
      expect(rollRes.status).toBe(404);
    });

    it('should return 400 when out of credits', async () => {
      const agent = request.agent(app);
      await agent.post('/api/session');

      // Drain all credits by rolling
      let status = 200;
      for (let i = 0; i < 20 && status === 200; i++) {
        const res = await agent.post('/api/session/roll');
        status = res.status;
        if (res.body.credits === 0 && status === 200) {
          // Next roll should fail
          const nextRes = await agent.post('/api/session/roll');
          expect(nextRes.status).toBe(400);
          expect(nextRes.body.error).toContain('credits');
          return;
        }
      }
    });
  });

  describe('POST /api/session/cashout', () => {
    it('should cash out and close the session', async () => {
      const agent = request.agent(app);
      await agent.post('/api/session');

      const cashoutRes = await agent.post('/api/session/cashout');
      expect(cashoutRes.status).toBe(200);
      expect(cashoutRes.body.credits).toBe(10);
      expect(cashoutRes.body.message).toContain('Cashed out');
    });

    it('should persist session to database on cashout', async () => {
      const agent = request.agent(app);
      const createRes = await agent.post('/api/session').send({ playerId: 'persist-test' });
      const { sessionId } = createRes.body;

      await agent.post('/api/session/cashout');

      // Verify session was persisted to SQLite
      const persistedSession = await getPersistedSession(sessionId);
      expect(persistedSession).not.toBeNull();
      expect(persistedSession!.playerId).toBe('persist-test');
      expect(persistedSession!.credits).toBe(10);
      expect(persistedSession!.active).toBe(false);
    });

    it('should return 404 when no session exists', async () => {
      const res = await request(app).post('/api/session/cashout');
      expect(res.status).toBe(404);
    });

    it('should not allow double cashout', async () => {
      const agent = request.agent(app);
      await agent.post('/api/session');

      await agent.post('/api/session/cashout');
      // After cashout, session is destroyed
      const res = await agent.post('/api/session/cashout');
      expect(res.status).toBe(404);
    });
  });
});
