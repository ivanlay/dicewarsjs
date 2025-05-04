/**
 * Game Utilities Bridge Module
 *
 * This is a bridge module that exports ES6 module functions to the global scope
 * for compatibility with the legacy code while enabling the incremental transition to ES6.
 */

// Import ES6 module implementations
import * as GameUtils from '../utils/gameUtils.js';

// Also export as ES6 module for new code
export * from '../utils/gameUtils.js';

// Create fallback implementations
const fallbacks = {
  calculateAttackProbability: () => {
    console.error('calculateAttackProbability not found in GameUtils module');
    return 0;
  },
  simulateAttack: () => {
    console.error('simulateAttack not found in GameUtils module');
    return false;
  },
  rollDice: () => {
    console.error('rollDice not found in GameUtils module');
    return 1;
  },
  analyzeTerritory: () => {
    console.error('analyzeTerritory not found in GameUtils module');
    return {};
  },
  findBestAttack: () => {
    console.error('findBestAttack not found in GameUtils module');
    return null;
  },
  calculateReinforcements: () => {
    console.error('calculateReinforcements not found in GameUtils module');
    return 0;
  },
};

// Export all functions to the global scope for legacy code compatibility
try {
  window.calculateAttackProbability =
    GameUtils.calculateAttackProbability ?? fallbacks.calculateAttackProbability;
  window.simulateAttack = GameUtils.simulateAttack ?? fallbacks.simulateAttack;
  window.rollDice = GameUtils.rollDice ?? fallbacks.rollDice;
  window.analyzeTerritory = GameUtils.analyzeTerritory ?? fallbacks.analyzeTerritory;
  window.findBestAttack = GameUtils.findBestAttack ?? fallbacks.findBestAttack;
  window.calculateReinforcements =
    GameUtils.calculateReinforcements ?? fallbacks.calculateReinforcements;

  console.log('Game utilities bridge module initialized successfully');
} catch (error) {
  console.error('Failed to initialize game utilities bridge module:', error);

  // Provide fallback implementations to prevent game crashes
  window.calculateAttackProbability = fallbacks.calculateAttackProbability;
  window.simulateAttack = fallbacks.simulateAttack;
  window.rollDice = fallbacks.rollDice;
  window.analyzeTerritory = fallbacks.analyzeTerritory;
  window.findBestAttack = fallbacks.findBestAttack;
  window.calculateReinforcements = fallbacks.calculateReinforcements;
}
