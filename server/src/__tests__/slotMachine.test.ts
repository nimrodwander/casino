import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateRoll, isWin, getReward, rollWithCheat } from '../services/slotMachine.js';
import { ALL_SYMBOLS, SYMBOL_REWARDS } from '@casino/shared';

describe('SlotMachine', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateRoll', () => {
    it('should return an array of 3 symbols', () => {
      const roll = generateRoll();
      expect(roll).toHaveLength(3);
      roll.forEach((symbol) => {
        expect(ALL_SYMBOLS).toContain(symbol);
      });
    });
  });

  describe('isWin', () => {
    it('should return true when all symbols match', () => {
      expect(isWin(['C', 'C', 'C'])).toBe(true);
      expect(isWin(['L', 'L', 'L'])).toBe(true);
      expect(isWin(['O', 'O', 'O'])).toBe(true);
      expect(isWin(['W', 'W', 'W'])).toBe(true);
    });

    it('should return false when symbols differ', () => {
      expect(isWin(['C', 'L', 'O'])).toBe(false);
      expect(isWin(['C', 'C', 'L'])).toBe(false);
      expect(isWin(['W', 'L', 'W'])).toBe(false);
    });
  });

  describe('getReward', () => {
    it('should return correct reward for each symbol', () => {
      expect(getReward('C')).toBe(10);
      expect(getReward('L')).toBe(20);
      expect(getReward('O')).toBe(30);
      expect(getReward('W')).toBe(40);
    });
  });

  describe('rollWithCheat', () => {
    it('should return a valid result with low credits (no cheat)', () => {
      const result = rollWithCheat(10);
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
      // Mock Math.random to always produce a win (all same symbol)
      // Index 0 = 'C' in ALL_SYMBOLS
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0); // Always picks first symbol 'C'

      const result = rollWithCheat(30);
      expect(result.symbols).toEqual(['C', 'C', 'C']);
      expect(result.win).toBe(true);
      expect(result.reward).toBe(10);
      // Math.random called 3 times for the roll, no cheat roll
      expect(mockRandom).toHaveBeenCalledTimes(3);
    });

    it('should re-roll with 30% chance when credits are between 40-60 and roll is a win', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      // First 3 calls: generate winning roll (all 'C' with value 0)
      // 4th call: cheat chance check (0.1 < 0.3 → re-roll triggered)
      // Next 3 calls: re-roll symbols
      mockRandom
        .mockReturnValueOnce(0)    // symbol 1: C (floor(0*4)=0)
        .mockReturnValueOnce(0)    // symbol 2: C
        .mockReturnValueOnce(0)    // symbol 3: C → win
        .mockReturnValueOnce(0.1)  // cheat chance: 0.1 < 0.3 → re-roll
        .mockReturnValueOnce(0.1)  // re-roll symbol 1: C (floor(0.1*4)=0)
        .mockReturnValueOnce(0.3)  // re-roll symbol 2: L (floor(0.3*4)=1)
        .mockReturnValueOnce(0.6); // re-roll symbol 3: O (floor(0.6*4)=2)

      const result = rollWithCheat(50);
      expect(result.symbols).toEqual(['C', 'L', 'O']);
      expect(result.win).toBe(false);
      expect(result.reward).toBe(0);
    });

    it('should not re-roll when cheat chance fails (credits 40-60)', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom
        .mockReturnValueOnce(0) // C
        .mockReturnValueOnce(0) // C
        .mockReturnValueOnce(0) // C → win
        .mockReturnValueOnce(0.5); // 0.5 >= 0.3 → no re-roll

      const result = rollWithCheat(50);
      expect(result.symbols).toEqual(['C', 'C', 'C']);
      expect(result.win).toBe(true);
    });

    it('should re-roll with 60% chance when credits are above 60 and roll is a win', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom
        .mockReturnValueOnce(0)    // C
        .mockReturnValueOnce(0)    // C
        .mockReturnValueOnce(0)    // C → win
        .mockReturnValueOnce(0.4)  // 0.4 < 0.6 → re-roll
        .mockReturnValueOnce(0.1)  // re-roll symbol 1: C (floor(0.1*4)=0)
        .mockReturnValueOnce(0.3)  // re-roll symbol 2: L (floor(0.3*4)=1)
        .mockReturnValueOnce(0.6); // re-roll symbol 3: O (floor(0.6*4)=2)

      const result = rollWithCheat(70);
      expect(result.symbols).toEqual(['C', 'L', 'O']);
      expect(result.win).toBe(false);
    });

    it('should never cheat on a losing roll', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      // Produce a losing roll
      mockRandom
        .mockReturnValueOnce(0)    // C
        .mockReturnValueOnce(0.25) // L
        .mockReturnValueOnce(0.5); // O → loss

      const result = rollWithCheat(100); // High credits, but loss = no cheat
      expect(result.win).toBe(false);
      // Only 3 calls — no cheat check
      expect(mockRandom).toHaveBeenCalledTimes(3);
    });
  });
});
