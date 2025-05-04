/**
 * Integration Tests for Bridge Modules
 * 
 * These tests verify that the bridge modules correctly expose ES6 functionality
 * to the global scope for backward compatibility with legacy code.
 */

// Import utility functions from ES6 modules to compare with global scope
import { calculateAttackProbability, rollDice } from '../../src/utils/gameUtils.js';
import { AI_REGISTRY } from '../../src/mechanics/aiHandler.js';
import { Game } from '../../src/Game.js';
import { ai_default, ai_defensive, ai_example, ai_adaptive } from '../../src/ai/index.js';

describe('Bridge Module Integration', () => {
  describe('Game Bridge', () => {
    test('exposes Game class to global scope', () => {
      // Import the bridge module to trigger the code
      require('../../src/bridge/Game.js');
      
      // Verify that Game is available in the global scope
      expect(window.Game).toBeDefined();
      expect(typeof window.Game).toBe('function');
      
      // Verify it's the same as the ES6 module
      expect(window.Game).toBe(Game);
    });
    
    test('Game constructor can be used from global scope', () => {
      // Require the bridge module
      require('../../src/bridge/Game.js');
      
      // Create a new game instance using the global constructor
      const gameInstance = new window.Game();
      
      // Check that it has expected properties
      expect(gameInstance.XMAX).toBe(28);
      expect(gameInstance.YMAX).toBe(32);
      expect(gameInstance.cel_max).toBe(gameInstance.XMAX * gameInstance.YMAX);
    });
  });
  
  describe('AI Bridge', () => {
    test('exposes AI functions to global scope', () => {
      // Import the bridge module to trigger the code
      require('../../src/bridge/ai.js');
      
      // Verify that AI functions are available in the global scope
      expect(window.ai_default).toBeDefined();
      expect(window.ai_defensive).toBeDefined();
      expect(window.ai_example).toBeDefined();
      expect(window.ai_adaptive).toBeDefined();
      
      // Verify they're the same as the ES6 modules
      expect(window.ai_default).toBe(ai_default);
      expect(window.ai_defensive).toBe(ai_defensive);
      expect(window.ai_example).toBe(ai_example);
      expect(window.ai_adaptive).toBe(ai_adaptive);
    });
  });
  
  describe('Game Utils Bridge', () => {
    test('exposes utility functions to global scope', () => {
      // Import the bridge module to trigger the code
      require('../../src/bridge/gameUtils.js');
      
      // Verify that utility functions are available in the global scope
      expect(window.calculateAttackProbability).toBeDefined();
      expect(window.rollDice).toBeDefined();
      
      // Verify they're the same as the ES6 modules
      expect(window.calculateAttackProbability).toBe(calculateAttackProbability);
      expect(window.rollDice).toBe(rollDice);
    });
    
    test('calculateAttackProbability works both from ES6 module and global scope', () => {
      // Import the bridge module
      require('../../src/bridge/gameUtils.js');
      
      // Test using both ES6 module and global scope versions
      const es6Result = calculateAttackProbability(3, 2);
      const globalResult = window.calculateAttackProbability(3, 2);
      
      // They should be identical
      expect(globalResult).toBe(es6Result);
      expect(globalResult).toBeGreaterThan(0);
    });
    
    test('rollDice works both from ES6 module and global scope', () => {
      // Import the bridge module
      require('../../src/bridge/gameUtils.js');
      
      // Test using both ES6 module and global scope versions
      const es6Result = rollDice(3);
      const globalResult = window.rollDice(3);
      
      // Check structure but not exact values (which are random)
      expect(es6Result.length).toBe(3);
      expect(globalResult.length).toBe(3);
      
      // Check that values are within valid dice range
      for (const roll of es6Result) {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      }
      
      for (const roll of globalResult) {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      }
    });
  });
  
  describe('Bridge Index Module', () => {
    test('checkBridgeStatus returns the status of all bridge modules', () => {
      // Import the bridge index to trigger initialization
      require('../../src/bridge/index.js');
      
      // Check that the status checking function is available
      expect(window.checkBridgeStatus).toBeDefined();
      expect(typeof window.checkBridgeStatus).toBe('function');
      
      // Call the function to get the status
      const status = window.checkBridgeStatus();
      
      // Verify it contains status for all bridge modules
      expect(status).toHaveProperty('gameUtils');
      expect(status).toHaveProperty('render');
      expect(status).toHaveProperty('sound');
      expect(status).toHaveProperty('ai');
      expect(status).toHaveProperty('game');
      
      // Verify all modules report as 'loaded'
      expect(status.gameUtils).toBe('loaded');
      expect(status.render).toBe('loaded');
      expect(status.sound).toBe('loaded');
      expect(status.ai).toBe('loaded');
      expect(status.game).toBe('loaded');
    });
  });
});