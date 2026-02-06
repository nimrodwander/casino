import { getSessionRepository } from '../database.js';
import { Session } from '../entities/Session.js';

export type { Session };

// Persist session data to SQLite on cashout
export async function persistSession(
  sessionId: string,
  playerId: string,
  credits: number
): Promise<Session> {
  const repo = getSessionRepository();
  const session = repo.create({
    id: sessionId,
    playerId,
    credits,
    active: false, // Session is closed when cashed out
  });
  await repo.save(session);
  return session;
}

// Get a persisted session from the database
export async function getPersistedSession(id: string): Promise<Session | null> {
  const repo = getSessionRepository();
  return repo.findOneBy({ id });
}

// Get all persisted sessions for a player
export async function getPlayerSessions(playerId: string): Promise<Session[]> {
  const repo = getSessionRepository();
  return repo.findBy({ playerId });
}

// Clear all sessions (for testing)
export async function clearAllSessions(): Promise<void> {
  const repo = getSessionRepository();
  await repo.clear();
}
