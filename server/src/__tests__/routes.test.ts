import express from 'express';
import 'reflect-metadata';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { GameHistoryEntity } from '../entities/gameHistory.entity.js';
import { sessionMiddleware } from '../middlewares/session.middleware.js';
import { GameRouter } from '../routers/game.router.js';
import { GameHistoryRepositoryService } from '../services/gameHistoryRepository.service.js';

let testDataSource: DataSource;
let gameHistoryRepository: GameHistoryRepositoryService;

function createApp(): express.Express {
  const app = express();
  app.use(express.json());
  app.use(sessionMiddleware);
  const gameRouter = new GameRouter(gameHistoryRepository);
  app.use('/api/game', gameRouter.router);
  return app;
}

beforeAll(async () => {
  testDataSource = new DataSource({
    type: 'better-sqlite3',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [GameHistoryEntity],
  });
  await testDataSource.initialize();
  gameHistoryRepository = new GameHistoryRepositoryService(testDataSource.getRepository(GameHistoryEntity));
});

afterAll(async () => {
  if (testDataSource?.isInitialized) {
    await testDataSource.destroy();
  }
});

describe('Game Routes', () => {
  let app: express.Express;

  beforeEach(async () => {
    await gameHistoryRepository.clear();
    app = createApp();
  });

  describe('POST /api/game', () => {
    it('should create a new session with 10 credits', async () => {
      const res = await request(app).post('/api/game').send({ playerId: 'test-player' });
      expect(res.status).toBe(201);
      expect(res.body.sessionId).toBeDefined();
      expect(res.body.credits).toBe(10);
      expect(res.body.playerId).toBe('test-player');
    });

    it('should return existing session if one already exists', async () => {
      const agent = request.agent(app);

      const res1 = await agent.post('/api/game').send({ playerId: 'test-player' });
      expect(res1.status).toBe(201);

      const res2 = await agent.post('/api/game').send({ playerId: 'test-player' });
      expect(res2.status).toBe(200);
      expect(res2.body.sessionId).toBe(res1.body.sessionId);
      expect(res2.body.credits).toBe(res1.body.credits);
    });
  });

  describe('POST /api/game/roll', () => {
    it('should return a roll result', async () => {
      const agent = request.agent(app);
      await agent.post('/api/game');

      const rollRes = await agent.post('/api/game/roll');
      expect(rollRes.status).toBe(200);
      expect(rollRes.body.symbols).toHaveLength(3);
      expect(typeof rollRes.body.reward).toBe('number');
      expect(typeof rollRes.body.credits).toBe('number');
    });

    it('should deduct 1 credit per roll on a loss', async () => {
      const agent = request.agent(app);
      await agent.post('/api/game');

      let lastCredits = 10;
      for (let i = 0; i < 5; i++) {
        const rollRes = await agent.post('/api/game/roll');
        if (rollRes.body.reward === 0) {
          expect(rollRes.body.credits).toBe(lastCredits - 1);
        }
        lastCredits = rollRes.body.credits;
      }
    });

    it('should return 404 when no session exists', async () => {
      const res = await request(app).post('/api/game/roll');
      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });

    it('should return 404 after cashout', async () => {
      const agent = request.agent(app);
      await agent.post('/api/game');
      await agent.post('/api/game/cashout');

      const rollRes = await agent.post('/api/game/roll');
      expect(rollRes.status).toBe(404);
    });

    it('should return 400 when out of credits', async () => {
      const agent = request.agent(app);
      await agent.post('/api/game');

      let status = 200;
      for (let i = 0; i < 20 && status === 200; i++) {
        const res = await agent.post('/api/game/roll');
        status = res.status;
        if (res.body.credits === 0 && status === 200) {
          const nextRes = await agent.post('/api/game/roll');
          expect(nextRes.status).toBe(400);
          expect(nextRes.body.error).toContain('credits');
          return;
        }
      }
    });
  });

  describe('POST /api/game/cashout', () => {
    it('should cash out and close the session', async () => {
      const agent = request.agent(app);
      await agent.post('/api/game');

      const cashoutRes = await agent.post('/api/game/cashout');
      expect(cashoutRes.status).toBe(200);
      expect(cashoutRes.body.credits).toBe(10);
      expect(cashoutRes.body.message).toContain('Cashed out');
    });

    it('should persist session to database on cashout', async () => {
      const agent = request.agent(app);
      const createRes = await agent.post('/api/game').send({ playerId: 'persist-test' });
      const { sessionId } = createRes.body;

      await agent.post('/api/game/cashout');

      const persistedSession = await gameHistoryRepository.findById(sessionId);
      expect(persistedSession).not.toBeNull();
      expect(persistedSession!.playerId).toBe('persist-test');
      expect(persistedSession!.credits).toBe(10);
    });

    it('should return 404 when no session exists', async () => {
      const res = await request(app).post('/api/game/cashout');
      expect(res.status).toBe(404);
    });

    it('should not allow double cashout', async () => {
      const agent = request.agent(app);
      await agent.post('/api/game');

      await agent.post('/api/game/cashout');
      const res = await agent.post('/api/game/cashout');
      expect(res.status).toBe(404);
    });
  });
});
