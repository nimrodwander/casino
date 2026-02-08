import { SYMBOLS } from '@casino/shared';
import { config } from '../config.js';


export interface RollResult {
  symbols: string[];
  reward: number;
}

export class GameService {
  private readonly allSymbols = Object.keys(SYMBOLS);
  private getRerollChance(credits: number): number {
    if (credits > config.cheatThresholdHigh) {
      return config.cheatChanceHigh;
    }
    if (credits >= config.cheatThresholdLow) {
      return config.cheatChanceLow;
    }
    return 0;
  }

  private generateRandomSymbol(): string {
    const index = Math.floor(Math.random() * this.allSymbols.length);
    return this.allSymbols[index];
  }

  private generateSymbolSequence(reelCount: number): string[] {
    return Array.from({ length: reelCount }, () => this.generateRandomSymbol());
  }

  private calculateReward(symbols: string[]): number {
    const isWin = symbols.every((s) => s === symbols[0]);
    return isWin ? SYMBOLS[symbols[0]] : 0;
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
