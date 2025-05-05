/**
 * Base Game Error Class
 *
 * Base class for all game-specific errors with standardized properties.
 */
import { gameEvents, EventType } from '../eventSystem.js';

export class GameError extends Error {
  /**
   * Create a new game error
   *
   * @param {string} message - Error message
   * @param {string} code - Error code for programmatic handling
   * @param {Object} [data={}] - Additional data relevant to the error
   */
  constructor(message, code, data = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.data = data;
    this.timestamp = Date.now();

    // Emit error event
    gameEvents.emit(EventType.CUSTOM, {
      type: 'error',
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        data: this.data,
      },
    });
  }

  /**
   * Get a string representation of the error
   *
   * @returns {string} Formatted error string
   */
  toString() {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}

export default GameError;
