/**
 * Error Handling Module
 *
 * Provides standardized error types and handling utilities for the game mechanics.
 * Implements robust error classes and catching mechanisms.
 */

// Import only the error classes we use in this file
import { GameError, TerritoryError, PlayerError } from './errors/index.js';

/**
 * Maps error codes to user-friendly messages
 *
 * @type {Object<string, string>}
 */
export const ERROR_MESSAGES = {
  ERR_TERRITORY: 'Territory operation failed',
  ERR_BATTLE: 'Battle could not be executed',
  ERR_PLAYER: 'Player operation failed',
  ERR_GAME_STATE: 'Game state operation failed',
  ERR_TERRITORY_NOT_FOUND: 'Territory does not exist',
  ERR_TERRITORY_NOT_OWNED: 'Territory not owned by player',
  ERR_TERRITORY_NOT_ADJACENT: 'Territories are not adjacent',
  ERR_INSUFFICIENT_DICE: 'Not enough dice to attack',
  ERR_INVALID_ATTACK: 'Invalid attack parameters',
  ERR_PLAYER_ELIMINATED: 'Player has been eliminated',
  ERR_INVALID_TURN: "Not player's turn",
  ERR_MAX_DICE_REACHED: 'Maximum dice reached in territory',
};

/**
 * Check if territories exist and are valid for an attack
 *
 * @param {Object} gameState - Current game state
 * @param {number} fromArea - Index of attacking territory
 * @param {number} toArea - Index of defending territory
 * @param {number} [currentPlayerId] - ID of current player (for ownership check)
 * @throws {TerritoryError} If territory validation fails
 */
export const validateTerritories = (gameState, fromArea, toArea, currentPlayerId) => {
  const { adat, AREA_MAX } = gameState;

  // Check if territories exist
  if (fromArea <= 0 || fromArea >= AREA_MAX || !adat[fromArea] || adat[fromArea].size === 0) {
    throw new TerritoryError('Attacking territory does not exist', fromArea, {
      code: 'ERR_TERRITORY_NOT_FOUND',
    });
  }

  if (toArea <= 0 || toArea >= AREA_MAX || !adat[toArea] || adat[toArea].size === 0) {
    throw new TerritoryError('Target territory does not exist', toArea, {
      code: 'ERR_TERRITORY_NOT_FOUND',
    });
  }

  // Check if attacking from own territory
  if (currentPlayerId !== undefined && adat[fromArea].arm !== currentPlayerId) {
    throw new TerritoryError("Cannot attack from territory you don't own", fromArea, {
      code: 'ERR_TERRITORY_NOT_OWNED',
      ownerId: adat[fromArea].arm,
      currentPlayerId,
    });
  }

  // Check if attacking own territory
  if (adat[fromArea].arm === adat[toArea].arm) {
    throw new TerritoryError('Cannot attack your own territory', toArea, {
      code: 'ERR_INVALID_ATTACK',
      attackerOwner: adat[fromArea].arm,
      defenderOwner: adat[toArea].arm,
    });
  }

  // Check if territories are adjacent
  if (adat[fromArea].join[toArea] !== 1) {
    throw new TerritoryError('Territories are not adjacent', toArea, {
      code: 'ERR_TERRITORY_NOT_ADJACENT',
      fromArea,
      toArea,
    });
  }

  // Check if attacking territory has enough dice
  if (adat[fromArea].dice <= 1) {
    throw new TerritoryError('Need at least 2 dice to attack', fromArea, {
      code: 'ERR_INSUFFICIENT_DICE',
      dice: adat[fromArea].dice,
    });
  }
};

/**
 * Validate player for the current turn
 *
 * @param {Object} gameState - Current game state
 * @param {number} playerId - Player ID to validate
 * @throws {PlayerError} If player validation fails
 */
export const validatePlayer = (gameState, playerId) => {
  const { player, turn } = gameState;

  // Check if player exists
  if (!player[playerId]) {
    throw new PlayerError('Player does not exist', playerId, {
      code: 'ERR_PLAYER_NOT_FOUND',
    });
  }

  // Check if player is eliminated
  if (player[playerId].area_c === 0) {
    throw new PlayerError('Player has been eliminated', playerId, {
      code: 'ERR_PLAYER_ELIMINATED',
    });
  }

  // Check if it's player's turn
  if (turn !== playerId) {
    throw new PlayerError("Not player's turn", playerId, {
      code: 'ERR_INVALID_TURN',
      currentTurn: turn,
    });
  }
};

/**
 * Safely execute a function with proper error handling
 *
 * @param {Function} fn - Function to execute
 * @param {Function} [errorHandler] - Optional custom error handler
 * @returns {Function} Wrapped function with error handling
 */
export const withErrorHandling =
  (fn, errorHandler) =>
  (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      if (errorHandler) {
        return errorHandler(error, ...args);
      }

      // Default error handler - log and rethrow
      console.error(`Error in ${fn.name || 'anonymous function'}:`, error);

      // Convert to GameError if it's not already one
      if (!(error instanceof GameError)) {
        throw new GameError(error.message || 'Unknown error', 'ERR_UNKNOWN', {
          originalError: error,
        });
      }

      throw error;
    }
  };

/**
 * Get a user-friendly error message
 *
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyErrorMessage = error => {
  if (error instanceof GameError) {
    // Use specific error message if available
    if (error.code && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code];
    }

    // Use error message
    return error.message;
  }

  // Generic message for non-game errors
  return 'An error occurred in the game';
};

// Export additional error utilities as needed
export default {
  validateTerritories,
  validatePlayer,
  withErrorHandling,
  getUserFriendlyErrorMessage,
};
