import 'reflect-metadata';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import { Session } from '../entities/Session.js';
import { setDataSource } from '../database.js';
import {
  persistSession,
  getPersistedSession,
  getPlayerSessions,
  clearAllSessions,
} from '../services/sessionStore.js';

let testDataSource: DataSource;

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

describe('SessionStore', () => {
  beforeEach(async () => {
    await clearAllSessions();
  });

  describe('persistSession', () => {
    it('should persist a session with given data', async () => {
      const session = await persistSession('session-123', 'player-1', 50);
      expect(session.id).toBe('session-123');
      expect(session.playerId).toBe('player-1');
      expect(session.credits).toBe(50);
      expect(session.active).toBe(false);
    });

    it('should store the session in the database', async () => {
      await persistSession('session-456', 'player-2', 100);
      const fetched = await getPersistedSession('session-456');
      expect(fetched).not.toBeNull();
      expect(fetched!.playerId).toBe('player-2');
      expect(fetched!.credits).toBe(100);
    });
  });

  describe('getPersistedSession', () => {
    it('should return the session by id', async () => {
      await persistSession('session-789', 'player-3', 25);
      const fetched = await getPersistedSession('session-789');
      expect(fetched).not.toBeNull();
      expect(fetched!.id).toBe('session-789');
    });

    it('should return null for nonexistent id', async () => {
      const fetched = await getPersistedSession('nonexistent');
      expect(fetched).toBeNull();
    });
  });

  describe('getPlayerSessions', () => {
    it('should return all sessions for a player', async () => {
      await persistSession('session-1', 'player-x', 10);
      await persistSession('session-2', 'player-x', 20);
      await persistSession('session-3', 'player-y', 30);

      const playerXSessions = await getPlayerSessions('player-x');
      expect(playerXSessions).toHaveLength(2);
      expect(playerXSessions.map((s) => s.credits).sort()).toEqual([10, 20]);
    });

    it('should return empty array for player with no sessions', async () => {
      const sessions = await getPlayerSessions('no-sessions-player');
      expect(sessions).toEqual([]);
    });
  });

  describe('clearAllSessions', () => {
    it('should remove all sessions', async () => {
      await persistSession('session-a', 'player-1', 10);
      await persistSession('session-b', 'player-2', 20);

      await clearAllSessions();

      const session1 = await getPersistedSession('session-a');
      const session2 = await getPersistedSession('session-b');
      expect(session1).toBeNull();
      expect(session2).toBeNull();
    });
  });
});
