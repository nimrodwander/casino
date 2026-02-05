import { makeAutoObservable, runInAction } from 'mobx';
import type { SymbolTriplet } from '@casino/shared';
import { apiService } from '../services/api.service';

export class SlotMachineStore {
  public sessionId: string | null = null;
  public credits: number = 0;
  public symbols: SymbolTriplet | null = null;
  public revealedCount: number = 0;
  public spinning: boolean = false;
  public rolling: boolean = false;
  public message: string | null = null;
  public gameOver: boolean = false;

  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    makeAutoObservable(this, { timers: false } as any);
  }

  private clearTimers(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  public async startGame(): Promise<void> {
    try {
      this.clearTimers();
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

  public async rollSlots(): Promise<void> {
    if (!this.sessionId || this.spinning || this.gameOver) return;

    this.spinning = true;
    this.rolling = true;
    this.revealedCount = 0;
    this.symbols = null;
    this.message = null;

    try {
      const result = await apiService.roll(this.sessionId);

      runInAction(() => {
        this.symbols = result.symbols;
        this.rolling = false;
      });

      const t1 = setTimeout(() => runInAction(() => { this.revealedCount++; }), 1000);
      const t2 = setTimeout(() => runInAction(() => { this.revealedCount++; }), 2000);
      const t3 = setTimeout(() => runInAction(() => {
        this.revealedCount++;
        this.spinning = false;
        this.credits = result.credits;
        this.message = result.win
          ? `You won ${result.reward} credits!`
          : 'No luck this time.';
        this.gameOver = result.credits <= 0;
      }), 3000);

      this.timers = [t1, t2, t3];
    } catch {
      runInAction(() => {
        this.spinning = false;
        this.rolling = false;
        this.message = 'Roll failed. Try again.';
      });
    }
  }

  public async cashOutCredits(): Promise<void> {
    if (!this.sessionId || this.spinning) return;

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

  public reset(): void {
    this.clearTimers();
    this.sessionId = null;
    this.credits = 0;
    this.symbols = null;
    this.revealedCount = 0;
    this.spinning = false;
    this.rolling = false;
    this.message = null;
    this.gameOver = false;
  }
}

export const slotMachineStore = new SlotMachineStore();
