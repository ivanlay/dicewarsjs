/**
 * Main entry point for the Dice Wars game
 * This file initializes the game and loads all necessary modules
 */

// Import the modern ES6 modules directly
import { initGame } from './main.js';
import { Game } from './Game.js';
import { initSoundSystem, preloadSounds } from './utils/sound.js';

// Export modules for external usage (testing, debugging, etc.)
export * from './models/index.js';
export * from './ai/index.js';
export * from './utils/config.js';
export * from './utils/sound.js';
export * from './utils/render.js';
export * from './mechanics/index.js';
export { Game } from './Game.js';

// Initialize sound system
initSoundSystem();
preloadSounds();

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
  console.log('Starting Dice Wars ES6 edition');
  initGame();
});
