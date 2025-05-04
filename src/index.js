/**
 * Main entry point for the Dice Wars game
 * This file initializes the game and loads all necessary modules
 * 
 * Note: This is a transition module - it avoids conflicting with the legacy
 * scripts while still setting up the ES6 module system for future use.
 */

// Log that the ES6 module was loaded
console.log('Dice Wars ES6 module system loaded');

// Import bridge modules to expose ES6 functionality to legacy code
import './bridge/index.js';

// We're not initializing the game from here in the hybrid approach
// The game will be initialized by the legacy main.js script

// Export modules for reference and future use
export * from './models/index.js';
export * from './ai/index.js';
export * from './utils/config.js';
export { Game } from './Game.js';