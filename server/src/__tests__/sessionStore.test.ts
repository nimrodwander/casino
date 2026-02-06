import 'reflect-metadata';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import { Session } from '../entities/Session.js';
import { setDataSource } from '../database.js';
import {
  createSession,
  getSession,
  updateCredits,
  closeSession,
  clearAllSessions,
} from '../services/sessionStore.js';
import { INITIAL_CREDITS } from '@casino/shared';

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

  describe('createSession', () => {
    it('should create a session with a UUID and initial credits', async () => {
      const session = await createSession('test-player');
      expect(session.id).toBeDefined();
      expect(session.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(session.credits).toBe(INITIAL_CREDITS);
      expect(session.active).toBe(true);
    });

    it('should store the playerId', async () => {
      const session = await createSession('my-player-id');
      expect(session.playerId).toBe('my-player-id');
    });

    it('should create unique sessions', async () => {
      const session1 = await createSession('test-player');
      const session2 = await createSession('test-player');
      expect(session1.id).not.toBe(session2.id);
    });
  });

  describe('getSession', () => {
    it('should return the session by id', async () => {
      const created = await createSession('test-player');
      const fetched = await getSession(created.id);
      expect(fetched).toEqual(created);
    });

    it('should return null for nonexistent id', async () => {
      const fetched = await getSession('nonexistent');
      expect(fetched).toBeNull();
    });
  });

  describe('updateCredits', () => {
    it('should add credits', async () => {
      const session = await createSession('test-player');
      const updated = await updateCredits(session.id, 20);
      expect(updated.credits).toBe(INITIAL_CREDITS + 20);
    });

    it('should subtract credits', async () => {
      const session = await createSession('test-player');
      const updated = await updateCredits(session.id, -1);
      expect(updated.credits).toBe(INITIAL_CREDITS - 1);
    });

    it('should throw for nonexistent session', async () => {
      await expect(updateCredits('nonexistent', 10)).rejects.toThrow('not found');
    });

    it('should throw for closed session', async () => {
      const session = await createSession('test-player');
      await closeSession(session.id);
      await expect(updateCredits(session.id, 10)).rejects.toThrow('closed');
    });
  });

  describe('closeSession', () => {
    it('should mark session as inactive', async () => {
      const session = await createSession('test-player');
      const closed = await closeSession(session.id);
      expect(closed.active).toBe(false);
    });

    it('should throw for nonexistent session', async () => {
      await expect(closeSession('nonexistent')).rejects.toThrow('not found');
    });

    it('should throw if session already closed', async () => {
      const session = await createSession('test-player');
      await closeSession(session.id);
      await expect(closeSession(session.id)).rejects.toThrow('already closed');
    });
  });
});
