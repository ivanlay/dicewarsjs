/**
 * Game Loader
 * 
 * This file is responsible for setting up global variables and placeholders
 * needed by the legacy code before ES6 modules load.
 * 
 * It creates placeholder AI functions that will be replaced by the actual
 * implementations once the bridge modules load.
 */

console.log('Initializing game-loader.js...');

// Create placeholder AI functions
// These will be replaced by the real implementations via the bridge module
window.ai_default = function(game) {
  console.log('Using placeholder ai_default - this will be replaced by ES6 module');
  // Default implementation that just ends the turn
  return 0;
};

window.ai_defensive = function(game) {
  console.log('Using placeholder ai_defensive - this will be replaced by ES6 module');
  // Default implementation that just ends the turn
  return 0;
};

window.ai_example = function(game) {
  console.log('Using placeholder ai_example - this will be replaced by ES6 module');
  // Default implementation that just ends the turn
  return 0;
};

window.ai_adaptive = function(game) {
  console.log('Using placeholder ai_adaptive - this will be replaced by ES6 module');
  // Default implementation that just ends the turn
  return 0;
};

// Set up placeholder for AI registry
window.AI_REGISTRY = {
  ai_default: window.ai_default,
  ai_defensive: window.ai_defensive,
  ai_example: window.ai_example,
  ai_adaptive: window.ai_adaptive
};

// Set up config placeholder
if (!window.GAME_CONFIG) {
  window.GAME_CONFIG = { 
    humanPlayerIndex: 0,
    aiTypes: [
      null,                 // Player 0 (human)
      'ai_example',         // Player 1
      'ai_defensive',       // Player 2  
      'ai_adaptive',        // Player 3
      'ai_default',         // Player 4
      'ai_default',         // Player 5
      'ai_default',         // Player 6
      'ai_default'          // Player 7
    ],
    spectatorSpeedMultiplier: 2
  };
}

console.log('Game loader initialized global placeholders');