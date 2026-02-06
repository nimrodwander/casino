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

export class SlotMachineService {
  private randomSymbol(): SlotSymbol {
    const index = Math.floor(Math.random() * ALL_SYMBOLS.length);
    return ALL_SYMBOLS[index];
  }

  generateRoll(): SymbolTriplet {
    return [this.randomSymbol(), this.randomSymbol(), this.randomSymbol()];
  }

  isWin(symbols: SymbolTriplet): boolean {
    return symbols[0] === symbols[1] && symbols[1] === symbols[2];
  }

  getReward(symbol: SlotSymbol): number {
    return SYMBOL_REWARDS[symbol];
  }

  private getCheatChance(credits: number): number {
    if (credits > CHEAT_THRESHOLD_HIGH) {
      return CHEAT_CHANCE_HIGH;
    }
    if (credits >= CHEAT_THRESHOLD_LOW) {
      return CHEAT_CHANCE_LOW;
    }
    return 0;
  }

  private evaluateRoll(symbols: SymbolTriplet): RollResult {
    const win = this.isWin(symbols);
    const reward = win ? this.getReward(symbols[0]) : 0;
    return { symbols, win, reward };
  }

  roll(currentCredits: number): RollResult {
    const symbols = this.generateRoll();
    const result = this.evaluateRoll(symbols);

    if (!result.win) {
      return result;
    }

    const cheatChance = this.getCheatChance(currentCredits);
    if (cheatChance === 0) {
      return result;
    }

    // Decide whether to re-roll (house always wins!)
    if (Math.random() < cheatChance) {
      const rerolledSymbols = this.generateRoll();
      return this.evaluateRoll(rerolledSymbols);
    }

    return result;
  }
}
