export declare module 'express-session' {
  interface SessionData {
    gameSession: {
      playerId: string;
      credits: number;
    };
  }
}