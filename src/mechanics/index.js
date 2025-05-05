/**
 * Game Mechanics Module
 *
 * Exports all game mechanics functions from the submodules.
 * Provides a unified interface for map generation, battle resolution, error handling, and event handling.
 */

// Import and re-export mechanics modules

// Import event emitter instance and types
import { gameEvents, EventType } from './eventSystem.js';

// Export map generator functions
export * from './mapGenerator.js';

// Export battle resolution functions
export * from './battleResolution.js';

// Export AI handling utilities
export * from './aiHandler.js';

// Export event system (excluding default export to avoid conflicts)
export {
  EventType,
  getTerritoryEventData,
  emitTerritoryAttack,
  emitTerritoryCapture,
  emitDiceRolled,
  emitTerritoryReinforced,
  loggingMiddleware,
  createTimeTravel,
} from './eventSystem.js';

// Export error handling system
export * from './errorHandling.js';

// Export error classes
export * from './errors/index.js';

// Export the gameEvents instance
export { gameEvents };

/**
 * Error handler for global mechanics errors
 * Attaches to global event listeners for error reporting
 *
 * @param {Error} error - The error to handle
 * @param {Object} metadata - Additional metadata about the error context
 */
export const handleGlobalError = (error, metadata = {}) => {
  console.error('Game Mechanics Error:', error, metadata);

  // Emit error event for logging/analytics
  gameEvents.emit('custom', {
    type: 'global_error',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code || 'UNKNOWN',
      ...metadata,
    },
  });

  return {
    success: false,
    error,
    message: error.message || 'An unknown error occurred',
    metadata,
  };
};
