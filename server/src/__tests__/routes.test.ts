import express from 'express';
import 'reflect-metadata';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { sessionMiddleware } from '../config/session.config.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { SessionRouter } from '../routers/session.router.js';
import { setDataSource } from '../services/database.service.js';
import { SessionRepositoryService } from '../services/sessionRepository.service.js';

let testDataSource: DataSource;
let sessionRepository: SessionRepositoryService;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(sessionMiddleware);
  const sessionRouter = new SessionRouter(sessionRepository);
  app.use('/api/session', sessionRouter.router);
  return app;
}

beforeAll(async () => {
  testDataSource = new DataSource({
    type: 'better-sqlite3',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [SessionEntity],
  });
  await testDataSource.initialize();
  setDataSource(testDataSource);
  sessionRepository = new SessionRepositoryService();
});

afterAll(async () => {
  if (testDataSource?.isInitialized) {
    await testDataSource.destroy();
  }
});

describe('Session Routes', () => {
  let app: express.Express;

  beforeEach(async () => {
    await sessionRepository.clear();
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

    it('should return existing session if one already exists', async () => {
      const agent = request.agent(app);

      const res1 = await agent.post('/api/session').send({ playerId: 'test-player' });
      expect(res1.status).toBe(201);

      const res2 = await agent.post('/api/session').send({ playerId: 'test-player' });
      expect(res2.status).toBe(200);
      expect(res2.body.sessionId).toBe(res1.body.sessionId);
      expect(res2.body.credits).toBe(res1.body.credits);
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

    it('should return 404 after cashout', async () => {
      const agent = request.agent(app);
      await agent.post('/api/session');
      await agent.post('/api/session/cashout');

      const rollRes = await agent.post('/api/session/roll');
      expect(rollRes.status).toBe(404);
    });

    it('should return 400 when out of credits', async () => {
      const agent = request.agent(app);
      await agent.post('/api/session');

      let status = 200;
      for (let i = 0; i < 20 && status === 200; i++) {
        const res = await agent.post('/api/session/roll');
        status = res.status;
        if (res.body.credits === 0 && status === 200) {
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

      const persistedSession = await sessionRepository.findById(sessionId);
      expect(persistedSession).not.toBeNull();
      expect(persistedSession!.playerId).toBe('persist-test');
      expect(persistedSession!.credits).toBe(10);
    });

    it('should return 404 when no session exists', async () => {
      const res = await request(app).post('/api/session/cashout');
      expect(res.status).toBe(404);
    });

    it('should not allow double cashout', async () => {
      const agent = request.agent(app);
      await agent.post('/api/session');

      await agent.post('/api/session/cashout');
      const res = await agent.post('/api/session/cashout');
      expect(res.status).toBe(404);
    });
  });
});
