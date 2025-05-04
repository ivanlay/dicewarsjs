/**
 * Enhanced Mechanics Index
 *
 * This file exports all enhanced game mechanics modules that use modern ES6+ data structures
 * like Map objects for better performance and more idiomatic JavaScript.
 */

export {
  // Map generation
  makeMap,
  setAreaTc,
  percolate,
  setAreaLine,
} from './mapGenerator.js';

export {
  // Battle resolution
  executeAttack,
  distributeReinforcements,
  setPlayerTerritoryData,
  rollDice,
  calculateAttackProbability,
  resolveBattle,
} from './battleResolution.js';

// Re-export AI handler from main directory as it hasn't been enhanced yet
import { executeAIMove, AI_REGISTRY } from '../aiHandler.js';
export { executeAIMove, AI_REGISTRY };
