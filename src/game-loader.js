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

/**
 * Create placeholder AI functions
 * These will be replaced by the real implementations via the bridge module
 *
 * These placeholder AI functions make simple decisions instead of
 * just returning 0 (ending turn) immediately
 */
window.ai_default = function (game) {
  // Only warn if we're not expecting ES6 modules to load
  if (!window.ES6_LOADING_STARTED) {
    console.warn('Using placeholder ai_default - ES6 module not loaded');
  }

  /**
   * Simple AI implementation that makes random valid moves
   * Try to find any territory we own with dice > 1
   */
  const myTerritories = [];
  for (let i = 0; i < game.adat.length; i++) {
    if (game.adat[i].arm === game.get_pn() && game.adat[i].dice > 1) {
      myTerritories.push(i);
    }
  }

  // No valid moves, end turn
  if (myTerritories.length === 0) return 0;

  // Try each territory to find valid attacks
  for (const myArea of myTerritories) {
    // Check all possible neighbors
    for (let j = 0; j < game.adat.length; j++) {
      // If adjacent and owned by enemy
      if (game.adat[myArea].join[j] && game.adat[j].arm !== game.get_pn()) {
        // If we have more dice, attack!
        if (game.adat[myArea].dice > game.adat[j].dice) {
          game.area_from = myArea;
          game.area_to = j;
          return 1; // Return non-zero to continue turn after attack
        }
      }
    }
  }

  // No good moves found
  return 0;
};

// Make the other AIs use the default AI implementation
window.ai_defensive = function (game) {
  // Only warn if we're not expecting ES6 modules to load
  if (!window.ES6_LOADING_STARTED) {
    console.warn('Using placeholder ai_defensive - ES6 module not loaded');
  }
  return window.ai_default(game);
};

window.ai_example = function (game) {
  // Only warn if we're not expecting ES6 modules to load
  if (!window.ES6_LOADING_STARTED) {
    console.warn('Using placeholder ai_example - ES6 module not loaded');
  }
  return window.ai_default(game);
};

window.ai_adaptive = function (game) {
  // Only warn if we're not expecting ES6 modules to load
  if (!window.ES6_LOADING_STARTED) {
    console.warn('Using placeholder ai_adaptive - ES6 module not loaded');
  }
  return window.ai_default(game);
};

// Set up placeholder for AI registry
window.AI_REGISTRY = {
  ai_default: window.ai_default,
  ai_defensive: window.ai_defensive,
  ai_example: window.ai_example,
  ai_adaptive: window.ai_adaptive,
};

/*
 * Make the AI registry accessible by string keys
 * This is needed for AI vs AI mode where player 0 needs an AI function
 */
window.getAIFunctionByName = function (aiName) {
  if (!aiName || typeof aiName !== 'string') return window.ai_default;

  const aiFunction = window.AI_REGISTRY[aiName];
  if (typeof aiFunction === 'function') return aiFunction;

  console.warn(`AI type ${aiName} not found, using default AI`);
  return window.ai_default;
};

// Set up config placeholder
window.GAME_CONFIG = window.GAME_CONFIG || {};

console.log('Game loader initialized global placeholders');
