/**
 * Enhanced Game Bridge Module
 * 
 * This bridge file exposes the enhanced ES6 Game class to the global scope,
 * enabling backward compatibility with the legacy code while using the new
 * Map-based data structures.
 */

import { Game } from '../../enhanced/Game.js';

try {
  // Make the ES6 Game class available in the global scope
  window.EnhancedGame = Game;
  
  console.log('Enhanced Game bridge initialized successfully');
} catch (error) {
  console.error('Error initializing enhanced Game bridge:', error);
  
  // Provide a fallback in case of error
  window.EnhancedGame = class FallbackGame {
    constructor() {
      console.error('Using fallback Game implementation due to initialization error');
    }
  };
}