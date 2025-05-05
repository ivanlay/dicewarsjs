/**
 * Enhanced Game Bridge Module
 * 
 * Provides bridging between the enhanced ES6 Game implementation
 * and the legacy global game object.
 */

import { Game } from '../../enhanced/Game.js';

// Create an enhanced Game instance
const gameInstance = new Game();

// Export the enhanced game instance
export { gameInstance as game, Game };