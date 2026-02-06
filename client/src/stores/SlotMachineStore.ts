import { makeAutoObservable, runInAction } from 'mobx';
import type { SymbolTriplet, RollResponse } from '@casino/shared';
import { apiService } from '../services/api.service';

export class SlotMachineStore {
  public sessionId: string | null = null;
  public credits = 0;
  public symbols: SymbolTriplet | null = null;
  public lastRoll: RollResponse | null = null;
  public gameOver = false;

  public constructor() {
    makeAutoObservable(this);
  }

  public async startGame(): Promise<void> {
    const { sessionId, credits } = await apiService.createSession();
    runInAction(() => {
      this.reset();
      this.sessionId = sessionId;
      this.credits = credits;
    });
  }

  public async roll(): Promise<RollResponse | null> {
    if (!this.sessionId || this.gameOver) return null;

    this.symbols = null;

    const result = await apiService.roll(this.sessionId);
    runInAction(() => {
      this.lastRoll = result;
      this.symbols = result.symbols;
    });
    return result;
  }

  public applyRollResult(result: RollResponse): void {
    this.credits = result.credits;
    this.gameOver = result.credits <= 0;
  }

  public async cashOut(): Promise<void> {
    if (!this.sessionId) return;

    await apiService.cashOut(this.sessionId);
    runInAction(() => {
      this.gameOver = true;
    });
  }

  public reset(): void {
    this.sessionId = null;
    this.credits = 0;
    this.symbols = null;
    this.lastRoll = null;
    this.gameOver = false;
  }
}

export const slotMachineStore = new SlotMachineStore();
