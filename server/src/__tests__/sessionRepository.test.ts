import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SessionEntity } from '../entities/Session.entity.js';
import { setDataSource } from '../services/database.service.js';
import { SessionRepositoryService } from '../services/sessionRepository.service.js';

let testDataSource: DataSource;
let sessionRepository: SessionRepositoryService;

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

describe('SessionRepositoryService', () => {
  beforeEach(async () => {
    await sessionRepository.clear();
  });

  describe('persist', () => {
    it('should persist a session with given data', async () => {
      const session = await sessionRepository.persist('session-123', 'player-1', 50);
      expect(session.id).toBe('session-123');
      expect(session.playerId).toBe('player-1');
      expect(session.credits).toBe(50);
      expect(session.active).toBe(false);
    });

    it('should store the session in the database', async () => {
      await sessionRepository.persist('session-456', 'player-2', 100);
      const fetched = await sessionRepository.findById('session-456');
      expect(fetched).not.toBeNull();
      expect(fetched!.playerId).toBe('player-2');
      expect(fetched!.credits).toBe(100);
    });
  });

  describe('findById', () => {
    it('should return the session by id', async () => {
      await sessionRepository.persist('session-789', 'player-3', 25);
      const fetched = await sessionRepository.findById('session-789');
      expect(fetched).not.toBeNull();
      expect(fetched!.id).toBe('session-789');
    });

    it('should return null for nonexistent id', async () => {
      const fetched = await sessionRepository.findById('nonexistent');
      expect(fetched).toBeNull();
    });
  });

  describe('findByPlayerId', () => {
    it('should return all sessions for a player', async () => {
      await sessionRepository.persist('session-1', 'player-x', 10);
      await sessionRepository.persist('session-2', 'player-x', 20);
      await sessionRepository.persist('session-3', 'player-y', 30);

      const playerXSessions = await sessionRepository.findByPlayerId('player-x');
      expect(playerXSessions).toHaveLength(2);
      expect(playerXSessions.map((s) => s.credits).sort()).toEqual([10, 20]);
    });

    it('should return empty array for player with no sessions', async () => {
      const sessions = await sessionRepository.findByPlayerId('no-sessions-player');
      expect(sessions).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should remove all sessions', async () => {
      await sessionRepository.persist('session-a', 'player-1', 10);
      await sessionRepository.persist('session-b', 'player-2', 20);

      await sessionRepository.clear();

      const session1 = await sessionRepository.findById('session-a');
      const session2 = await sessionRepository.findById('session-b');
      expect(session1).toBeNull();
      expect(session2).toBeNull();
    });
  });
});
