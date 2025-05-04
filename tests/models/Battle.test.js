/**
 * Tests for Battle Model Class
 * 
 * This file contains tests for the Battle class, which holds data
 * for dice battle visualization and resolution.
 */

import { Battle } from '../../src/models/Battle.js';

describe('Battle', () => {
  let battle;
  
  beforeEach(() => {
    // Create a fresh Battle instance for each test
    battle = new Battle();
  });
  
  describe('Constructor', () => {
    test('initializes with default values', () => {
      expect(battle.dn).toBe(0);
      expect(battle.arm).toBe(0);
      expect(battle.dmax).toBe(0);
      expect(battle.sum).toBe(0);
    });
    
    test('initializes arrays with correct values', () => {
      // Dice values array
      expect(battle.deme).toBeInstanceOf(Array);
      expect(battle.deme.length).toBe(8);
      expect(battle.deme).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
      
      // Animation finished flags
      expect(battle.fin).toBeInstanceOf(Array);
      expect(battle.fin.length).toBe(8);
      expect(battle.fin).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
      
      // Dice indices to use
      expect(battle.usedice).toBeInstanceOf(Array);
      expect(battle.usedice.length).toBe(8);
      expect(battle.usedice).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });
  });
  
  describe('Battle Properties', () => {
    test('can set and retrieve dice number', () => {
      battle.dn = 5;
      expect(battle.dn).toBe(5);
    });
    
    test('can set and retrieve player affiliation', () => {
      battle.arm = 3;
      expect(battle.arm).toBe(3);
    });
    
    test('can set and retrieve max dice count', () => {
      battle.dmax = 6;
      expect(battle.dmax).toBe(6);
    });
    
    test('can set and retrieve dice sum', () => {
      battle.sum = 24;
      expect(battle.sum).toBe(24);
    });
  });
  
  describe('Dice Management', () => {
    test('can set and retrieve individual dice values', () => {
      // Set dice values as if they were rolled
      battle.deme[0] = 6;
      battle.deme[1] = 3;
      battle.deme[2] = 4;
      battle.deme[3] = 1;
      battle.deme[4] = 5;
      
      // Check individual values
      expect(battle.deme[0]).toBe(6);
      expect(battle.deme[1]).toBe(3);
      expect(battle.deme[2]).toBe(4);
      expect(battle.deme[3]).toBe(1);
      expect(battle.deme[4]).toBe(5);
    });
    
    test('can calculate sum of dice values', () => {
      // Set dice values
      battle.deme[0] = 6;
      battle.deme[1] = 3;
      battle.deme[2] = 4;
      
      // Set max dice count
      battle.dmax = 3;
      
      // Calculate sum
      battle.sum = 0;
      for (let i = 0; i < battle.dmax; i++) {
        battle.sum += battle.deme[i];
      }
      
      // Check sum
      expect(battle.sum).toBe(13);
    });
    
    test('can track animation state for each die', () => {
      // Set some dice as finished animating
      battle.fin[0] = 1;
      battle.fin[1] = 1;
      battle.fin[2] = 0;  // Not finished
      
      // Check animation states
      expect(battle.fin[0]).toBe(1);
      expect(battle.fin[1]).toBe(1);
      expect(battle.fin[2]).toBe(0);
      
      // Calculate number of dice that finished animating
      let finishedCount = 0;
      for (let i = 0; i < battle.fin.length; i++) {
        if (battle.fin[i] === 1) {
          finishedCount++;
        }
      }
      
      // Check count
      expect(finishedCount).toBe(2);
    });
    
    test('can shuffle dice indices for animation', () => {
      // Start with default order
      expect(battle.usedice).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
      
      // Shuffle algorithm (simplified version for testing)
      const shuffled = [...battle.usedice];
      
      // Manual shuffle for testing (in a real game, this would be random)
      shuffled[0] = 3;
      shuffled[1] = 0;
      shuffled[2] = 7;
      shuffled[3] = 1;
      shuffled[4] = 4;
      shuffled[5] = 2;
      shuffled[6] = 6;
      shuffled[7] = 5;
      
      battle.usedice = shuffled;
      
      // Check shuffled array
      expect(battle.usedice).toEqual([3, 0, 7, 1, 4, 2, 6, 5]);
      expect(battle.usedice).not.toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
      
      // Check that all indices are still present
      const sorted = [...battle.usedice].sort((a, b) => a - b);
      expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });
  });
  
  describe('Battle Resolution', () => {
    test('can determine if all dice have finished animating', () => {
      // Set max dice
      battle.dmax = 3;
      
      // Set all dice as finished
      battle.fin[0] = 1;
      battle.fin[1] = 1;
      battle.fin[2] = 1;
      
      // Check if all dice are finished
      let allFinished = true;
      for (let i = 0; i < battle.dmax; i++) {
        if (battle.fin[i] === 0) {
          allFinished = false;
          break;
        }
      }
      
      // Should be true
      expect(allFinished).toBe(true);
      
      // Set one die as not finished
      battle.fin[1] = 0;
      
      // Check again
      allFinished = true;
      for (let i = 0; i < battle.dmax; i++) {
        if (battle.fin[i] === 0) {
          allFinished = false;
          break;
        }
      }
      
      // Should be false now
      expect(allFinished).toBe(false);
    });
    
    test('can determine battle outcome by comparing dice sums', () => {
      // Create two battle objects to represent attacker and defender
      const attacker = new Battle();
      const defender = new Battle();
      
      // Set up attacker
      attacker.dmax = 3;
      attacker.deme[0] = 6;
      attacker.deme[1] = 5;
      attacker.deme[2] = 4;
      attacker.sum = 15;
      
      // Set up defender
      defender.dmax = 2;
      defender.deme[0] = 4;
      defender.deme[1] = 3;
      defender.sum = 7;
      
      // Determine outcome
      const attackerWins = attacker.sum > defender.sum;
      
      // Attacker should win
      expect(attackerWins).toBe(true);
      
      // Modify defender to win
      defender.deme[0] = 6;
      defender.deme[1] = 6;
      defender.sum = 12;
      attacker.deme[0] = 3;
      attacker.deme[1] = 2;
      attacker.deme[2] = 2;
      attacker.sum = 7;
      
      // Recalculate
      const attackerWinsAfterChange = attacker.sum > defender.sum;
      
      // Attacker should lose now
      expect(attackerWinsAfterChange).toBe(false);
    });
  });
});