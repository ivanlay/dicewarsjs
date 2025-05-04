/**
 * Tests for Game Utilities Module
 */
import {
  calculateAttackProbability,
  rollDice,
  simulateAttack
} from '../../src/utils/gameUtils.js';

describe('Game Utilities', () => {
  describe('calculateAttackProbability', () => {
    test('returns 0 if attacker has 1 or fewer dice', () => {
      expect(calculateAttackProbability(1, 3)).toBe(0);
      expect(calculateAttackProbability(0, 3)).toBe(0);
    });
    
    test('returns 0 if defender has 0 dice', () => {
      expect(calculateAttackProbability(3, 0)).toBe(0);
    });
    
    test('returns higher probability when attacker has more dice', () => {
      const lowAdvantage = calculateAttackProbability(3, 2);
      const highAdvantage = calculateAttackProbability(8, 2);
      expect(highAdvantage).toBeGreaterThan(lowAdvantage);
    });
    
    test('returns approximately 0.45 for equal dice counts', () => {
      expect(calculateAttackProbability(3, 3)).toBeCloseTo(0.45, 2);
    });
    
    test('caps probability at 0.95 for overwhelming advantage', () => {
      expect(calculateAttackProbability(20, 1)).toBeLessThanOrEqual(0.95);
    });
  });
  
  describe('rollDice', () => {
    test('returns an array of the correct length', () => {
      expect(rollDice(3).length).toBe(3);
      expect(rollDice(5).length).toBe(5);
    });
    
    test('returns values between 1 and 6 inclusive', () => {
      const rolls = rollDice(100);  // Roll a lot of dice to ensure we test thoroughly
      rolls.forEach(roll => {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      });
    });
    
    test('returns an empty array for 0 dice', () => {
      expect(rollDice(0)).toEqual([]);
    });
  });
  
  describe('simulateAttack', () => {
    test('returns the correct result object structure', () => {
      const result = simulateAttack(3, 2);
      expect(result).toHaveProperty('attackerRolls');
      expect(result).toHaveProperty('defenderRolls');
      expect(result).toHaveProperty('attackerSum');
      expect(result).toHaveProperty('defenderSum');
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
    });
    
    test('has correct dice counts in result arrays', () => {
      const result = simulateAttack(3, 2);
      expect(result.attackerRolls.length).toBe(3);
      expect(result.defenderRolls.length).toBe(2);
    });
    
    test('correctly determines success based on dice sums', () => {
      // Mock the rollDice function to control the simulation outcome
      const originalRollDice = rollDice;
      
      // Mock for attacker win
      global.rollDice = jest.fn()
        .mockImplementationOnce(() => [6, 6, 6])  // Attacker rolls
        .mockImplementationOnce(() => [1, 1]);    // Defender rolls
      
      expect(simulateAttack(3, 2).success).toBe(true);
      
      // Mock for attacker loss
      global.rollDice = jest.fn()
        .mockImplementationOnce(() => [1, 1, 1])  // Attacker rolls
        .mockImplementationOnce(() => [6, 6]);    // Defender rolls
      
      expect(simulateAttack(3, 2).success).toBe(false);
      
      // Restore original function
      global.rollDice = originalRollDice;
    });
  });
});