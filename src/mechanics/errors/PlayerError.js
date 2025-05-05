/**
 * Player Error
 *
 * Represents an error related to player operations
 */
import { GameError } from './GameError.js';

export class PlayerError extends GameError {
  constructor(message, playerId, data = {}) {
    super(message, 'ERR_PLAYER', { ...data, playerId });
  }
}

export default PlayerError;
