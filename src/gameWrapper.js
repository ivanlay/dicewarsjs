/**
 * ES Module wrapper for the main Game class
 * Exposes the Game class to the global scope for legacy compatibility
 */
// Use the browser-compatible version for direct browser loading
import { Game } from './Game-browser.js';

// Expose to global scope for legacy compatibility
if (typeof window !== 'undefined') {
  window.Game = Game;
}

export { Game };
