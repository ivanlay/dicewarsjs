/**
 * Game Utilities Bridge Module
 * 
 * This is a bridge module that exports ES6 module functions to the global scope
 * for compatibility with the legacy code while enabling the incremental transition to ES6.
 */

// Import ES6 module implementations
import * as GameUtils from '../utils/gameUtils.js';

// Export all functions to the global scope for legacy code compatibility
window.calculateAttackProbability = GameUtils.calculateAttackProbability;
window.simulateAttack = GameUtils.simulateAttack;
window.rollDice = GameUtils.rollDice;
window.analyzeTerritory = GameUtils.analyzeTerritory;
window.findBestAttack = GameUtils.findBestAttack;
window.calculateReinforcements = GameUtils.calculateReinforcements;

// Also export as ES6 module for new code
export * from '../utils/gameUtils.js';