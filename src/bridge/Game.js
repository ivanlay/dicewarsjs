/**
 * Game Bridge Module
 * 
 * This bridge module exports the ES6 Game class to the global scope
 * for backward compatibility with the legacy code while enabling
 * incremental transition to the modern ES6 architecture.
 */

// Import the ES6 Game class
import { Game } from '../Game.js';

// Also export as ES6 module for new code
export { Game };

// Create fallback Game implementation for error cases
const FallbackGame = function() {
  console.error('Failed to initialize Game class - using fallback implementation');
  
  // Basic fallback properties
  this.pmax = 7;
  this.XMAX = 28;
  this.YMAX = 32;
  this.cel_max = this.XMAX * this.YMAX;
  
  // Stub methods to prevent crashes
  this.make_map = function() {
    console.error('Fallback Game.make_map called');
    return false;
  };
  
  this.start_game = function() {
    console.error('Fallback Game.start_game called');
    return false;
  };
  
  this.get_pn = function() {
    console.error('Fallback Game.get_pn called');
    return 0;
  };
};

// Export to global scope for legacy code compatibility
try {
  // Make the Game constructor available in the global scope
  window.Game = Game;
  
  console.log('Game bridge module initialized successfully');
} catch (error) {
  console.error('Failed to initialize Game bridge module:', error);
  
  // Provide fallback implementation to prevent game crashes
  window.Game = FallbackGame;
}