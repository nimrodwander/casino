import { INITIAL_CREDITS, ROLL_COST } from '@casino/shared';
import { SlotMachine, RollResult } from './slotMachine.js';

export class GameSession {
  private slotMachine: SlotMachine;

  constructor(
    public readonly id: string,
    public readonly playerId: string,
    private _credits: number = INITIAL_CREDITS,
    private _active: boolean = true
  ) {
    this.slotMachine = new SlotMachine();
  }

  get credits(): number {
    return this._credits;
  }

  get active(): boolean {
    return this._active;
  }

  canRoll(): boolean {
    return this._active && this._credits >= ROLL_COST;
  }

  roll(): RollResult {
    if (!this._active) {
      throw new Error('Session is closed');
    }
    if (this._credits < ROLL_COST) {
      throw new Error('Not enough credits');
    }

    // Deduct roll cost
    this._credits -= ROLL_COST;

    // Perform roll with potential cheat
    const result = this.slotMachine.roll(this._credits);

    // Add reward if won
    if (result.win) {
      this._credits += result.reward;
    }

    return result;
  }

  cashOut(): number {
    if (!this._active) {
      throw new Error('Session is already closed');
    }
    this._active = false;
    return this._credits;
  }

  toJSON() {
    return {
      id: this.id,
      playerId: this.playerId,
      credits: this._credits,
      active: this._active,
    };
  }
}
