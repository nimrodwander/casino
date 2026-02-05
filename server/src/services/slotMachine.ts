import {
  type SlotSymbol,
  type SymbolTriplet,
  ALL_SYMBOLS,
  SYMBOL_REWARDS,
  CHEAT_THRESHOLD_LOW,
  CHEAT_THRESHOLD_HIGH,
  CHEAT_CHANCE_LOW,
  CHEAT_CHANCE_HIGH,
} from '@casino/shared';

export interface RollResult {
  symbols: SymbolTriplet;
  win: boolean;
  reward: number;
}

function randomSymbol(): SlotSymbol {
  const index = Math.floor(Math.random() * ALL_SYMBOLS.length);
  return ALL_SYMBOLS[index];
}

export function generateRoll(): SymbolTriplet {
  return [randomSymbol(), randomSymbol(), randomSymbol()];
}

export function isWin(symbols: SymbolTriplet): boolean {
  return symbols[0] === symbols[1] && symbols[1] === symbols[2];
}

export function getReward(symbol: SlotSymbol): number {
  return SYMBOL_REWARDS[symbol];
}

function getCheatChance(credits: number): number {
  if (credits > CHEAT_THRESHOLD_HIGH) {
    return CHEAT_CHANCE_HIGH;
  }
  if (credits >= CHEAT_THRESHOLD_LOW) {
    return CHEAT_CHANCE_LOW;
  }
  return 0;
}

function evaluateRoll(symbols: SymbolTriplet): RollResult {
  const win = isWin(symbols);
  const reward = win ? getReward(symbols[0]) : 0;
  return { symbols, win, reward };
}

export function rollWithCheat(currentCredits: number): RollResult {
  const symbols = generateRoll();
  const result = evaluateRoll(symbols);

  if (!result.win) {
    return result;
  }

  const cheatChance = getCheatChance(currentCredits);
  if (cheatChance === 0) {
    return result;
  }

  // Decide whether to re-roll
  if (Math.random() < cheatChance) {
    const rerolledSymbols = generateRoll();
    return evaluateRoll(rerolledSymbols);
  }

  return result;
}
