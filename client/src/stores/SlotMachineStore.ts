import { makeAutoObservable, runInAction } from 'mobx';
import type { SymbolTriplet, RollResponse } from '@casino/shared';
import { apiService } from '../services/api.service';

export class SlotMachineStore {
  public sessionId: string | null = null;
  public playerId: string | null = null;
  public credits = 0;
  public symbols: SymbolTriplet | null = null;
  public lastRoll: RollResponse | null = null;

  public constructor() {
    makeAutoObservable(this);
  }

  public async startGame(playerId: string): Promise<void> {
    const { sessionId, credits, playerId: returnedPlayerId } = await apiService.createSession(playerId);
    runInAction(() => {
      this.reset();
      this.sessionId = sessionId;
      this.playerId = returnedPlayerId;
      this.credits = credits;
    });
  }

  public async roll(): Promise<RollResponse | null> {
    if (!this.sessionId) return null;

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
  }

  public async cashOut(): Promise<void> {
    if (!this.sessionId) return;
    await apiService.cashOut(this.sessionId);
  }

  public reset(): void {
    this.sessionId = null;
    this.playerId = null;
    this.credits = 0;
    this.symbols = null;
    this.lastRoll = null;
  }
}

export const slotMachineStore = new SlotMachineStore();
