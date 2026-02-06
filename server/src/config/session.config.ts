import session from 'express-session';

// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    gameSession: {
      playerId: string;
      credits: number;
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
