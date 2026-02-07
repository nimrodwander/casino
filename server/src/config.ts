export const gameConfig = {
  initialCredits: Number(process.env.INITIAL_CREDITS) || 10,
  rollCost: Number(process.env.ROLL_COST) || 1,
  cheatThresholdLow: Number(process.env.CHEAT_THRESHOLD_LOW) || 40,
  cheatThresholdHigh: Number(process.env.CHEAT_THRESHOLD_HIGH) || 60,
  cheatChanceLow: Number(process.env.CHEAT_CHANCE_LOW) || 0.3,
  cheatChanceHigh: Number(process.env.CHEAT_CHANCE_HIGH) || 0.6,
};
