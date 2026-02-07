import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SlotMachineService } from '../services/slotMachine.service.js';
import { ALL_SYMBOLS, SYMBOL_REWARDS } from '@casino/shared';

describe('SlotMachineService', () => {
  let slotMachine: SlotMachineService;

  beforeEach(() => {
    slotMachine = new SlotMachineService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateRoll', () => {
    it('should return an array of 3 symbols', () => {
      const roll = slotMachine.generateRoll(3);
      expect(roll).toHaveLength(3);
      roll.forEach((symbol) => {
        expect(ALL_SYMBOLS).toContain(symbol);
      });
    });
  });

  describe('isWin', () => {
    it('should return true when all symbols match', () => {
      expect(slotMachine.isWin(['C', 'C', 'C'])).toBe(true);
      expect(slotMachine.isWin(['L', 'L', 'L'])).toBe(true);
      expect(slotMachine.isWin(['O', 'O', 'O'])).toBe(true);
      expect(slotMachine.isWin(['W', 'W', 'W'])).toBe(true);
    });

    it('should return false when symbols differ', () => {
      expect(slotMachine.isWin(['C', 'L', 'O'])).toBe(false);
      expect(slotMachine.isWin(['C', 'C', 'L'])).toBe(false);
      expect(slotMachine.isWin(['W', 'L', 'W'])).toBe(false);
    });
  });

  describe('getReward', () => {
    it('should return correct reward for each symbol', () => {
      expect(slotMachine.getReward('C')).toBe(10);
      expect(slotMachine.getReward('L')).toBe(20);
      expect(slotMachine.getReward('O')).toBe(30);
      expect(slotMachine.getReward('W')).toBe(40);
    });
  });

  describe('roll', () => {
    it('should return a valid result with low credits (no cheat)', () => {
      const result = slotMachine.roll(10, 3);
      expect(result.symbols).toHaveLength(3);
      result.symbols.forEach((s) => expect(ALL_SYMBOLS).toContain(s));
      expect(typeof result.win).toBe('boolean');
      if (result.win) {
        expect(result.reward).toBe(SYMBOL_REWARDS[result.symbols[0]]);
      } else {
        expect(result.reward).toBe(0);
      }
    });

    it('should not cheat when credits are below 40', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0);

      const result = slotMachine.roll(30, 3);
      expect(result.symbols).toEqual(['C', 'C', 'C']);
      expect(result.win).toBe(true);
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
      expect(result.symbols).toEqual(['C', 'L', 'O']);
      expect(result.win).toBe(false);
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
      expect(result.symbols).toEqual(['C', 'C', 'C']);
      expect(result.win).toBe(true);
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
      expect(result.symbols).toEqual(['C', 'L', 'O']);
      expect(result.win).toBe(false);
    });

    it('should never cheat on a losing roll', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0.25)
        .mockReturnValueOnce(0.5);

      const result = slotMachine.roll(100, 3);
      expect(result.win).toBe(false);
      expect(mockRandom).toHaveBeenCalledTimes(3);
    });
  });
});
