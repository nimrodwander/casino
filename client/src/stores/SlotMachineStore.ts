import { makeAutoObservable, runInAction } from 'mobx';
import type { SymbolTriplet, RollResponse } from '@casino/shared';
import { apiService } from '../services/api.service';

export class SlotMachineStore {
  sessionId: string | null = null;
  credits = 0;
  symbols: SymbolTriplet | null = null;
  lastRoll: RollResponse | null = null;
  message: string | null = null;
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
      runInAction(() => {
        this.message = 'Failed to start game.';
      });
    }
  }

  async roll(): Promise<RollResponse | null> {
    if (!this.sessionId || this.gameOver) return null;

    this.symbols = null;
    this.message = null;

    try {
      const result = await apiService.roll(this.sessionId);
      runInAction(() => {
        this.lastRoll = result;
        this.symbols = result.symbols;
      });
      return result;
    } catch {
      runInAction(() => {
        this.message = 'Roll failed. Try again.';
      });
      return null;
    }
  }

  applyRollResult(result: RollResponse): void {
    this.credits = result.credits;
    this.message = result.win
      ? `You won ${result.reward} credits!`
      : 'No luck this time.';
    this.gameOver = result.credits <= 0;
  }

  async cashOut(): Promise<void> {
    if (!this.sessionId) return;

    try {
      const result = await apiService.cashOut(this.sessionId);
      runInAction(() => {
        this.gameOver = true;
        this.message = result.message;
      });
    } catch {
      runInAction(() => {
        this.message = 'Cash out failed.';
      });
    }
  }

  reset(): void {
    this.sessionId = null;
    this.credits = 0;
    this.symbols = null;
    this.lastRoll = null;
    this.message = null;
    this.gameOver = false;
  }
}

export const slotMachineStore = new SlotMachineStore();
