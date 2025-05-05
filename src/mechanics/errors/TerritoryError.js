/**
 * Territory Error
 *
 * Represents an error related to territory operations
 */
import { GameError } from './GameError.js';

export class TerritoryError extends GameError {
  constructor(message, territoryId, data = {}) {
    super(message, 'ERR_TERRITORY', { ...data, territoryId });
  }
}

export default TerritoryError;
