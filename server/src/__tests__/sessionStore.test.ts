import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSession,
  getSession,
  updateCredits,
  closeSession,
  clearAllSessions,
} from '../services/sessionStore.js';
import { INITIAL_CREDITS } from '@casino/shared';

describe('SessionStore', () => {
  beforeEach(() => {
    clearAllSessions();
  });

  describe('createSession', () => {
    it('should create a session with a UUID and initial credits', () => {
      const session = createSession();
      expect(session.id).toBeDefined();
      expect(session.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(session.credits).toBe(INITIAL_CREDITS);
      expect(session.active).toBe(true);
    });

    it('should create unique sessions', () => {
      const session1 = createSession();
      const session2 = createSession();
      expect(session1.id).not.toBe(session2.id);
    });
  });

  describe('getSession', () => {
    it('should return the session by id', () => {
      const created = createSession();
      const fetched = getSession(created.id);
      expect(fetched).toEqual(created);
    });

    it('should return undefined for nonexistent id', () => {
      const fetched = getSession('nonexistent');
      expect(fetched).toBeUndefined();
    });
  });

  describe('updateCredits', () => {
    it('should add credits', () => {
      const session = createSession();
      updateCredits(session.id, 20);
      expect(session.credits).toBe(INITIAL_CREDITS + 20);
    });

    it('should subtract credits', () => {
      const session = createSession();
      updateCredits(session.id, -1);
      expect(session.credits).toBe(INITIAL_CREDITS - 1);
    });

    it('should throw for nonexistent session', () => {
      expect(() => updateCredits('nonexistent', 10)).toThrow('not found');
    });

    it('should throw for closed session', () => {
      const session = createSession();
      closeSession(session.id);
      expect(() => updateCredits(session.id, 10)).toThrow('closed');
    });
  });

  describe('closeSession', () => {
    it('should mark session as inactive', () => {
      const session = createSession();
      closeSession(session.id);
      expect(session.active).toBe(false);
    });

    it('should throw for nonexistent session', () => {
      expect(() => closeSession('nonexistent')).toThrow('not found');
    });

    it('should throw if session already closed', () => {
      const session = createSession();
      closeSession(session.id);
      expect(() => closeSession(session.id)).toThrow('already closed');
    });
  });
});
