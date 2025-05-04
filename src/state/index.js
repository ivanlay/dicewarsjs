/**
 * State Management Index
 *
 * This module exports all immutable state management components
 * for use in the game.
 */

// Core state management
export { GameState, createInitialState } from './GameState.js';

// Entity state management
export { TerritoryState } from './TerritoryState.js';
export { PlayerState } from './PlayerState.js';

// Utility functions
export {
  // Object operations
  updateObject,
  deepFreeze,
  immutable,
  devImmutable,

  // Array operations
  updateArrayItem,
  addArrayItem,
  removeArrayItem,
  filterArray,
  mapArray,

  // Map/Set operations
  updateMap,
  deleteMapEntry,
  addSetItem,
  deleteSetItem,
} from './ImmutableUtils.js';
