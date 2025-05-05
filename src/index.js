/**
 * Main entry point for the Dice Wars game
 * This file initializes the game and loads all necessary modules
 */

// Import game loader to ensure correct initialization order
import { initializeGame } from './game-loader.js';

// Import the modern ES6 modules directly
import { initGame } from './main.js';
import { Game } from './Game.js';
import { initSoundSystem, preloadSounds } from './utils/sound.js';
import { ai_default, ai_defensive, ai_example, ai_adaptive } from './ai/index.js';
import { getConfig, applyConfigToGame } from './utils/config.js';

// Export modules for external usage (testing, debugging, etc.)
export * from './models/index.js';
export * from './ai/index.js';
export * from './utils/config.js';
export * from './utils/sound.js';
export * from './utils/render.js';
export * from './mechanics/index.js';
export { Game } from './Game.js';

// Directly expose essential objects to the global scope
// This replaces the bridge layer that's being removed
window.Game = Game;
window.ai_default = ai_default;
window.ai_defensive = ai_defensive;
window.ai_example = ai_example;
window.ai_adaptive = ai_adaptive;
window.getConfig = getConfig;
window.applyGameConfig = applyConfigToGame;

// Initialize library immediately rather than waiting for DOM to be ready
// This ensures window.Game is available as soon as possible
console.log('Starting Dice Wars ES6 edition - Direct Module Loading');

// Ensure Game constructor is explicitly available as a global
if (typeof window !== 'undefined') {
  // Log the current state to help with debugging
  console.log('Exposing Game constructor to global scope');
  console.log('Game constructor before:', typeof window.Game === 'function' ? 'Available' : 'Not available');
  
  // Explicitly expose Game to global scope
  window.Game = Game;
  
  // Log the state after our assignment to confirm it worked
  console.log('Game constructor after:', typeof window.Game === 'function' ? 'Available' : 'Not available');
}

// Make sure the game loader has run - do this immediately
if (!window.DiceWars?.initialized) {
  initializeGame();
}

// Also initialize when DOM is ready to handle the standard flow
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded - initializing sound system and game');
  
  // Initialize sound system
  initSoundSystem();
  preloadSounds();
  
  // Initialize the game
  initGame();
});