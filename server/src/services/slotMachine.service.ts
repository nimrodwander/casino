import {
  type SlotSymbol,
  ALL_SYMBOLS,
  SYMBOL_REWARDS,
  CHEAT_THRESHOLD_LOW,
  CHEAT_THRESHOLD_HIGH,
  CHEAT_CHANCE_LOW,
  CHEAT_CHANCE_HIGH,
} from '@casino/shared';

export interface RollResult {
  symbols: SlotSymbol[];
  win: boolean;
  reward: number;
}

export class SlotMachineService {
  private randomSymbol(): SlotSymbol {
    const index = Math.floor(Math.random() * ALL_SYMBOLS.length);
    return ALL_SYMBOLS[index];
  }

  public generateRoll(reelCount: number): SlotSymbol[] {
    return Array.from({ length: reelCount }, () => this.randomSymbol());
  }

  public isWin(symbols: SlotSymbol[]): boolean {
    return symbols.every((s) => s === symbols[0]);
  }

  public getReward(symbol: SlotSymbol): number {
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

  private evaluateRoll(symbols: SlotSymbol[]): RollResult {
    const win = this.isWin(symbols);
    const reward = win ? this.getReward(symbols[0]) : 0;
    return { symbols, win, reward };
  }

  public roll(currentCredits: number, reelCount: number): RollResult {
    const symbols = this.generateRoll(reelCount);
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
      const rerolledSymbols = this.generateRoll(reelCount);
      return this.evaluateRoll(rerolledSymbols);
    }

    return result;
  }
}
