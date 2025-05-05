/**
 * Game State Error
 *
 * Represents an error related to general game state operations
 */
import { GameError } from './GameError.js';

export class GameStateError extends GameError {
  constructor(message, data = {}) {
    super(message, 'ERR_GAME_STATE', data);
  }
}

export default GameStateError;
