import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SlotMachineService } from '../services/slotMachine.service.js';
import { SYMBOLS } from '@casino/shared';

const allSymbols = Object.keys(SYMBOLS);

describe('SlotMachineService', () => {
  let slotMachine: SlotMachineService;

  beforeEach(() => {
    slotMachine = new SlotMachineService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('roll', () => {
    it('should return a valid result with low credits (no cheat)', () => {
      const result = slotMachine.roll(10, 3);
      expect(result.symbols).toHaveLength(3);
      result.symbols.forEach((s) => expect(allSymbols).toContain(s));
      if (result.reward > 0) {
        expect(result.reward).toBe(SYMBOLS[result.symbols[0]]);
      } else {
        expect(result.reward).toBe(0);
      }
    });

    it('should not cheat when credits are below 40', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0);

      const result = slotMachine.roll(30, 3);
      expect(result.symbols).toEqual(['cherry', 'cherry', 'cherry']);
      expect(result.reward).toBe(10);
      expect(mockRandom).toHaveBeenCalledTimes(3);
    });

    it('should re-roll with 30% chance when credits are between 40-60 and roll is a win', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.6);

      const result = slotMachine.roll(50, 3);
      expect(result.symbols).toEqual(['cherry', 'lemon', 'orange']);
      expect(result.reward).toBe(0);
    });

    it('should not re-roll when cheat chance fails (credits 40-60)', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0.5);

      const result = slotMachine.roll(50, 3);
      expect(result.symbols).toEqual(['cherry', 'cherry', 'cherry']);
      expect(result.reward).toBe(10);
    });

    it('should re-roll with 60% chance when credits are above 60 and roll is a win', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0.4)
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.6);

      const result = slotMachine.roll(70, 3);
      expect(result.symbols).toEqual(['cherry', 'lemon', 'orange']);
      expect(result.reward).toBe(0);
    });

    it('should never cheat on a losing roll', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0.25)
        .mockReturnValueOnce(0.5);

      const result = slotMachine.roll(100, 3);
      expect(result.reward).toBe(0);
      expect(mockRandom).toHaveBeenCalledTimes(3);
    });
  });
});
