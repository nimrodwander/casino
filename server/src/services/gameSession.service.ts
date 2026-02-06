import { INITIAL_CREDITS, ROLL_COST } from '@casino/shared';
import { SlotMachineService, RollResult } from './slotMachine.service.js';

export class GameSessionService {
  private slotMachine: SlotMachineService;

  constructor(
    public readonly id: string,
    public readonly playerId: string,
    private _credits: number = INITIAL_CREDITS
  ) {
    this.slotMachine = new SlotMachineService();
  }

  get credits(): number {
    return this._credits;
  }

  canRoll(): boolean {
    return this._credits >= ROLL_COST;
  }

  roll(): RollResult {
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
    return this._credits;
  }
}
