import { v4 as uuidv4 } from 'uuid';
import { INITIAL_CREDITS } from '@casino/shared';

export interface Session {
  id: string;
  playerId: string;
  credits: number;
  active: boolean;
}

const sessions = new Map<string, Session>();

export function createSession(playerId: string): Session {
  const session: Session = {
    id: uuidv4(),
    playerId,
    credits: INITIAL_CREDITS,
    active: true,
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function updateCredits(id: string, delta: number): Session {
  const session = sessions.get(id);
  if (!session) {
    throw new Error(`Session ${id} not found`);
  }
  if (!session.active) {
    throw new Error(`Session ${id} is closed`);
  }
  session.credits += delta;
  return session;
}

export function closeSession(id: string): Session {
  const session = sessions.get(id);
  if (!session) {
    throw new Error(`Session ${id} not found`);
  }
  if (!session.active) {
    throw new Error(`Session ${id} is already closed`);
  }
  session.active = false;
  return session;
}

export function clearAllSessions(): void {
  sessions.clear();
}
