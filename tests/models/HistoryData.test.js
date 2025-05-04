/**
 * Tests for HistoryData Model Class
 * 
 * This file contains tests for the HistoryData class, which records
 * game actions for replay and history tracking.
 */

import { HistoryData } from '../../src/models/HistoryData.js';

describe('HistoryData', () => {
  let historyData;
  
  beforeEach(() => {
    // Create a fresh HistoryData instance for each test
    historyData = new HistoryData();
  });
  
  describe('Constructor', () => {
    test('initializes with default values', () => {
      expect(historyData.from).toBe(0);
      expect(historyData.to).toBe(0);
      expect(historyData.res).toBe(0);
    });
  });
  
  describe('Attack History', () => {
    test('can record a successful attack', () => {
      // Set up a successful attack from area 3 to area 7
      historyData.from = 3;
      historyData.to = 7;
      historyData.res = 1;  // Success
      
      // Check properties
      expect(historyData.from).toBe(3);
      expect(historyData.to).toBe(7);
      expect(historyData.res).toBe(1);
      
      // Check if it's an attack (to !== 0)
      const isAttack = historyData.to !== 0;
      expect(isAttack).toBe(true);
      
      // Check if it's successful (res === 1)
      const isSuccessful = historyData.res === 1;
      expect(isSuccessful).toBe(true);
    });
    
    test('can record a failed attack', () => {
      // Set up a failed attack from area 5 to area 10
      historyData.from = 5;
      historyData.to = 10;
      historyData.res = 0;  // Failure
      
      // Check properties
      expect(historyData.from).toBe(5);
      expect(historyData.to).toBe(10);
      expect(historyData.res).toBe(0);
      
      // Check if it's an attack (to !== 0)
      const isAttack = historyData.to !== 0;
      expect(isAttack).toBe(true);
      
      // Check if it's failed (res === 0)
      const isFailed = historyData.res === 0;
      expect(isFailed).toBe(true);
    });
  });
  
  describe('Reinforcement History', () => {
    test('can record a reinforcement', () => {
      // Set up a reinforcement for area 4
      historyData.from = 4;
      historyData.to = 0;   // 0 indicates reinforcement, not attack
      historyData.res = 0;  // Not applicable for reinforcements
      
      // Check properties
      expect(historyData.from).toBe(4);
      expect(historyData.to).toBe(0);
      expect(historyData.res).toBe(0);
      
      // Check if it's a reinforcement (to === 0)
      const isReinforcement = historyData.to === 0;
      expect(isReinforcement).toBe(true);
    });
  });
  
  describe('History Classification', () => {
    test('can be identified as an attack based on properties', () => {
      // Set up as an attack
      historyData.from = 3;
      historyData.to = 7;
      
      // Function to check if it's an attack
      const isAttack = historyData.to > 0;
      
      expect(isAttack).toBe(true);
    });
    
    test('can be identified as a reinforcement based on properties', () => {
      // Set up as a reinforcement
      historyData.from = 3;
      historyData.to = 0;
      
      // Function to check if it's a reinforcement
      const isReinforcement = historyData.to === 0 && historyData.from > 0;
      
      expect(isReinforcement).toBe(true);
    });
    
    test('can determine the player involved', () => {
      // In a real game, we would use the area index to look up
      // the player by checking adat[historyData.from].arm
      
      // This is a simplified version for testing
      const mockAreaData = [
        null,
        { arm: 1 },
        { arm: 2 },
        { arm: 3 },
        { arm: 1 }
      ];
      
      // Set history data
      historyData.from = 3;
      
      // Get player
      const player = mockAreaData[historyData.from].arm;
      
      expect(player).toBe(3);
    });
  });
});