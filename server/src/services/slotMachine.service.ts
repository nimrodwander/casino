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
  reward: number;
}

export class SlotMachineService {
  private getRerollChance(credits: number): number {
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

  private calculateReward(symbols: SlotSymbol[]): number {
    const isWin = symbols.every((s) => s === symbols[0]);
    return isWin ? SYMBOL_REWARDS[symbols[0]] : 0;
  }

  public roll(currentCredits: number, reelCount: number): RollResult {
    let generatedSymbols = this.generateSymbolSequence(reelCount);
    let reward = this.calculateReward(generatedSymbols);

    if (reward === 0) {
      return { symbols: generatedSymbols, reward };
    }

    const rerollChance = this.getRerollChance(currentCredits);
    
    if (rerollChance > 0 && Math.random() < rerollChance) {
      generatedSymbols = this.generateSymbolSequence(reelCount);
      reward = this.calculateReward(generatedSymbols);
    }

    return { symbols: generatedSymbols, reward };
  }
}
