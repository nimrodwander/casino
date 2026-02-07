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
  private getCheatChance(credits: number): number {
    if (credits > CHEAT_THRESHOLD_HIGH) {
      return CHEAT_CHANCE_HIGH;
    }
    if (credits >= CHEAT_THRESHOLD_LOW) {
      return CHEAT_CHANCE_LOW;
    }
    return 0;
  }

  private generateRandomSymbol(): SlotSymbol {
    const index = Math.floor(Math.random() * ALL_SYMBOLS.length);
    return ALL_SYMBOLS[index];
  }

  private generateSymbolSequence(reelCount: number): SlotSymbol[] {
    return Array.from({ length: reelCount }, () => this.generateRandomSymbol());
  }

  private evaluate(symbols: SlotSymbol[]): RollResult {
    const win = symbols.every((s) => s === symbols[0]);
    const reward = win ? SYMBOL_REWARDS[symbols[0]] : 0;
    return { symbols, win, reward };
  }

  public roll(currentCredits: number, reelCount: number): RollResult {
    const symbols = this.generateSymbolSequence(reelCount);
    const result = this.evaluate(symbols);

    if (!result.win) {
      return result;
    }

    const cheatChance = this.getCheatChance(currentCredits);
    if (cheatChance === 0) {
      return result;
    }

    // Decide whether to re-roll (house always wins!)
    if (Math.random() < cheatChance) {
      const rerolledSymbols = this.generateSymbolSequence(reelCount);
      return this.evaluate(rerolledSymbols);
    }

    return result;
  }
}
