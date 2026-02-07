import { SYMBOLS } from '@casino/shared';
import { gameConfig } from '../config.js';

const allSymbols = Object.keys(SYMBOLS);

export interface RollResult {
  symbols: string[];
  reward: number;
}

export class SlotMachineService {
  private getRerollChance(credits: number): number {
    if (credits > gameConfig.cheatThresholdHigh) {
      return gameConfig.cheatChanceHigh;
    }
    if (credits >= gameConfig.cheatThresholdLow) {
      return gameConfig.cheatChanceLow;
    }
    return 0;
  }

  private generateRandomSymbol(): string {
    const index = Math.floor(Math.random() * allSymbols.length);
    return allSymbols[index];
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
