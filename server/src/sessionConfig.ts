import session, { Session, SessionData } from 'express-session';
import { INITIAL_CREDITS } from '@casino/shared';

// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    gameSession: {
      playerId: string;
      credits: number;
      active: boolean;
    };
  }
}

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'casino-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});

type GameSession = Session & Partial<SessionData>;

export function createGameSession(sess: GameSession, playerId: string): void {
  sess.gameSession = {
    playerId,
    credits: INITIAL_CREDITS,
    active: true,
  };
}

export function getGameSession(sess: GameSession) {
  return sess.gameSession;
}

export function updateGameCredits(sess: GameSession, delta: number): void {
  if (!sess.gameSession) {
    throw new Error('No active game session');
  }
  if (!sess.gameSession.active) {
    throw new Error('Game session is closed');
  }
  sess.gameSession.credits += delta;
}

export function closeGameSession(sess: GameSession): void {
  if (!sess.gameSession) {
    throw new Error('No active game session');
  }
  if (!sess.gameSession.active) {
    throw new Error('Game session is already closed');
  }
  sess.gameSession.active = false;
}
