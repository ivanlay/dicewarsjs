/**
 * Tests for PlayerData Model Class
 * 
 * This file contains tests for the PlayerData class, which tracks a player's
 * game state, including territory ownership, dice counts and reinforcements.
 */

import { PlayerData } from '../../src/models/PlayerData.js';

describe('PlayerData', () => {
  let playerData;
  
  beforeEach(() => {
    // Create a fresh PlayerData instance for each test
    playerData = new PlayerData();
  });
  
  describe('Constructor', () => {
    test('initializes with default values', () => {
      // Territory ownership
      expect(playerData.area_c).toBe(0);
      expect(playerData.area_tc).toBe(0);
      
      // Dice counts
      expect(playerData.dice_c).toBe(0);
      expect(playerData.dice_jun).toBe(0);
      
      // Reinforcements
      expect(playerData.stock).toBe(0);
    });
  });
  
  describe('Territory Tracking', () => {
    test('can set and retrieve total territory count', () => {
      playerData.area_c = 8;
      expect(playerData.area_c).toBe(8);
    });
    
    test('can set and retrieve connected territory count', () => {
      playerData.area_tc = 6;
      expect(playerData.area_tc).toBe(6);
    });
    
    test('can update territory counts incrementally', () => {
      // Start with 0 territories
      expect(playerData.area_c).toBe(0);
      
      // Add territories one by one
      playerData.area_c += 1;
      expect(playerData.area_c).toBe(1);
      
      playerData.area_c += 2;
      expect(playerData.area_c).toBe(3);
      
      // Remove a territory
      playerData.area_c -= 1;
      expect(playerData.area_c).toBe(2);
    });
  });
  
  describe('Dice Tracking', () => {
    test('can set and retrieve total dice count', () => {
      playerData.dice_c = 15;
      expect(playerData.dice_c).toBe(15);
    });
    
    test('can set and retrieve dice ranking', () => {
      playerData.dice_jun = 3; // Player ranks 3rd in dice count
      expect(playerData.dice_jun).toBe(3);
    });
    
    test('can update dice counts incrementally', () => {
      // Start with 0 dice
      expect(playerData.dice_c).toBe(0);
      
      // Add dice one by one
      playerData.dice_c += 3;
      expect(playerData.dice_c).toBe(3);
      
      playerData.dice_c += 5;
      expect(playerData.dice_c).toBe(8);
      
      // Remove dice
      playerData.dice_c -= 2;
      expect(playerData.dice_c).toBe(6);
    });
  });
  
  describe('Reinforcement Management', () => {
    test('can set and retrieve reinforcement stock', () => {
      playerData.stock = 5;
      expect(playerData.stock).toBe(5);
    });
    
    test('can update reinforcement stock incrementally', () => {
      // Start with 0 reinforcements
      expect(playerData.stock).toBe(0);
      
      // Add reinforcements
      playerData.stock += 3;
      expect(playerData.stock).toBe(3);
      
      // Use reinforcements
      playerData.stock -= 1;
      expect(playerData.stock).toBe(2);
    });
  });
  
  describe('Player State Calculations', () => {
    test('can calculate reinforcement allocation based on territory count', () => {
      // Set up player with territories and connected territory count
      playerData.area_c = 12;
      playerData.area_tc = 8;
      
      // Simple reinforcement calculation (example algorithm)
      const reinforcements = Math.floor(playerData.area_tc / 3);
      
      // Check result
      expect(reinforcements).toBe(2);
    });
    
    test('can calculate if player is eliminated', () => {
      // Player with no territories is eliminated
      playerData.area_c = 0;
      expect(playerData.area_c).toBe(0);
      
      // Determine if player is eliminated
      const isEliminated = playerData.area_c === 0;
      expect(isEliminated).toBe(true);
      
      // Player with territories is not eliminated
      playerData.area_c = 3;
      expect(playerData.area_c > 0).toBe(true);
    });
    
    test('can track dice-to-territory ratio', () => {
      // Set up player with territories and dice
      playerData.area_c = 5;
      playerData.dice_c = 15;
      
      // Calculate ratio
      const ratio = playerData.area_c > 0 ? playerData.dice_c / playerData.area_c : 0;
      
      // Check result (average of 3 dice per territory)
      expect(ratio).toBe(3);
    });
  });
});