/**
 * Battle Error
 *
 * Represents an error related to battle operations
 */
import { GameError } from './GameError.js';

export class BattleError extends GameError {
  constructor(message, fromArea, toArea, data = {}) {
    super(message, 'ERR_BATTLE', { ...data, fromArea, toArea });
  }
}

export default BattleError;
