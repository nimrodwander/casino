export const config = {
  port: Number(process.env.PORT) || 3001,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  dbPath: process.env.DB_PATH || 'casino.db',
  sessionSecret: process.env.SESSION_SECRET || 'casino-secret-key-change-in-production',
  isProduction: process.env.NODE_ENV === 'production',
  initialCredits: Number(process.env.INITIAL_CREDITS) || 10,
  rollCost: Number(process.env.ROLL_COST) || 1,
  cheatThresholdLow: Number(process.env.CHEAT_THRESHOLD_LOW) || 40,
  cheatThresholdHigh: Number(process.env.CHEAT_THRESHOLD_HIGH) || 60,
  cheatChanceLow: Number(process.env.CHEAT_CHANCE_LOW) || 0.3,
  cheatChanceHigh: Number(process.env.CHEAT_CHANCE_HIGH) || 0.6,
};
