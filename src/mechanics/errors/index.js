/**
 * Error Module Exports
 *
 * Consolidates all error types for easy importing.
 */
import { GameError } from './GameError.js';
import { TerritoryError } from './TerritoryError.js';
import { BattleError } from './BattleError.js';
import { PlayerError } from './PlayerError.js';
import { GameStateError } from './GameStateError.js';

// Export all error types
export { GameError, TerritoryError, BattleError, PlayerError, GameStateError };

// Re-export the default object with all error types
export default {
  GameError,
  TerritoryError,
  BattleError,
  PlayerError,
  GameStateError,
};
