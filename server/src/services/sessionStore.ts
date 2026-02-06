import { v4 as uuidv4 } from 'uuid';
import { INITIAL_CREDITS } from '@casino/shared';
import { getSessionRepository } from '../database.js';
import { Session } from '../entities/Session.js';

export type { Session };

export async function createSession(playerId: string): Promise<Session> {
  const repo = getSessionRepository();
  const session = repo.create({
    id: uuidv4(),
    playerId,
    credits: INITIAL_CREDITS,
    active: true,
  });
  await repo.save(session);
  return session;
}

export async function getSession(id: string): Promise<Session | null> {
  const repo = getSessionRepository();
  return repo.findOneBy({ id });
}

export async function updateCredits(id: string, delta: number): Promise<Session> {
  const repo = getSessionRepository();
  const session = await repo.findOneBy({ id });

  if (!session) {
    throw new Error(`Session ${id} not found`);
  }
  if (!session.active) {
    throw new Error(`Session ${id} is closed`);
  }

  session.credits += delta;
  await repo.save(session);
  return session;
}

export async function closeSession(id: string): Promise<Session> {
  const repo = getSessionRepository();
  const session = await repo.findOneBy({ id });

  if (!session) {
    throw new Error(`Session ${id} not found`);
  }
  if (!session.active) {
    throw new Error(`Session ${id} is already closed`);
  }

  session.active = false;
  await repo.save(session);
  return session;
}

export async function clearAllSessions(): Promise<void> {
  const repo = getSessionRepository();
  await repo.clear();
}
