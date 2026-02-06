import { makeAutoObservable, runInAction } from 'mobx';
import type { SymbolTriplet, RollResponse } from '@casino/shared';
import { apiService } from '../services/api.service';

export class SlotMachineStore {
  sessionId: string | null = null;
  credits = 0;
  symbols: SymbolTriplet | null = null;
  lastRoll: RollResponse | null = null;
  gameOver = false;

  constructor() {
    makeAutoObservable(this);
  }

  async startGame(): Promise<void> {
    try {
      const { sessionId, credits } = await apiService.createSession();
      runInAction(() => {
        this.reset();
        this.sessionId = sessionId;
        this.credits = credits;
      });
    } catch {
      // start game failed
    }
  }

  async roll(): Promise<RollResponse | null> {
    if (!this.sessionId || this.gameOver) return null;

    this.symbols = null;

    try {
      const result = await apiService.roll(this.sessionId);
      runInAction(() => {
        this.lastRoll = result;
        this.symbols = result.symbols;
      });
      return result;
    } catch {
      return null;
    }
  }

  applyRollResult(result: RollResponse): void {
    this.credits = result.credits;
    this.gameOver = result.credits <= 0;
  }

  async cashOut(): Promise<void> {
    if (!this.sessionId) return;

    try {
      await apiService.cashOut(this.sessionId);
      runInAction(() => {
        this.gameOver = true;
      });
    } catch {
      // cash out failed
    }
  }

  reset(): void {
    this.sessionId = null;
    this.credits = 0;
    this.symbols = null;
    this.lastRoll = null;
    this.gameOver = false;
  }
}

export const slotMachineStore = new SlotMachineStore();
