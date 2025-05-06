/**
 * AI Bridge Module
 *
 * This is a bridge module that exports ES6 module AI implementations to the global scope
 * for compatibility with the legacy code while enabling the incremental transition to ES6.
 */

// Import ES6 module implementations
import { ai_default, ai_defensive, ai_example, ai_adaptive } from '../ai/index.js';

// Also export as ES6 module for new code
export { ai_default, ai_defensive, ai_example, ai_adaptive };

// Create fallback AI function that returns random valid moves
const fallbackAI = (game, playerIndex) => {
  console.error('Using fallback AI function');
  // Simple fallback that attempts to return a basic move
  if (!game?.areas?.length) {
    console.error('Invalid game state provided to fallback AI');
    return null;
  }

  // Find territories owned by this player
  const playerTerritories = game.areas
    .map((area, index) => ({ index, area }))
    .filter(({ area }) => area.owner === playerIndex);

  if (playerTerritories.length === 0) {
    return null; // No territories left
  }

  // Return a random territory index as a basic move
  return playerTerritories[Math.floor(Math.random() * playerTerritories.length)].index;
};

// Create fallback AI wrappers
const fallbacks = {
  ai_default: (game, playerIndex) => {
    console.error('ai_default not found in AI module, using fallback');
    return fallbackAI(game, playerIndex);
  },
  ai_defensive: (game, playerIndex) => {
    console.error('ai_defensive not found in AI module, using fallback');
    return fallbackAI(game, playerIndex);
  },
  ai_example: (game, playerIndex) => {
    console.error('ai_example not found in AI module, using fallback');
    return fallbackAI(game, playerIndex);
  },
  ai_adaptive: (game, playerIndex) => {
    console.error('ai_adaptive not found in AI module, using fallback');
    return fallbackAI(game, playerIndex);
  },
};

// Export all AI functions to the global scope for legacy code compatibility
try {
  // Initialize the AI registry if it doesn't exist
  if (!window.AI_REGISTRY) {
    window.AI_REGISTRY = {};
    console.log('Created global AI_REGISTRY');
  }

  // Set AI functions with fallbacks, and update the AI registry
  if (typeof ai_default === 'function') {
    window.ai_default = ai_default;
    window.AI_REGISTRY.ai_default = ai_default;
    console.log('ES6 ai_default loaded successfully');
  } else {
    console.warn('ES6 ai_default not found, using fallback');
    window.ai_default = fallbacks.ai_default;
    window.AI_REGISTRY.ai_default = fallbacks.ai_default;
  }
  if (typeof ai_defensive === 'function') {
    window.ai_defensive = ai_defensive;
    window.AI_REGISTRY.ai_defensive = ai_defensive;
    console.log('ES6 ai_defensive loaded successfully');
  } else {
    console.warn('ES6 ai_defensive not found, using fallback');
    window.ai_defensive = fallbacks.ai_defensive;
    window.AI_REGISTRY.ai_defensive = fallbacks.ai_defensive;
  }

  if (typeof ai_example === 'function') {
    window.ai_example = ai_example;
    window.AI_REGISTRY.ai_example = ai_example;
    console.log('ES6 ai_example loaded successfully');
  } else {
    console.warn('ES6 ai_example not found, using fallback');
    window.ai_example = fallbacks.ai_example;
    window.AI_REGISTRY.ai_example = fallbacks.ai_example;
  }

  if (typeof ai_adaptive === 'function') {
    window.ai_adaptive = ai_adaptive;
    window.AI_REGISTRY.ai_adaptive = ai_adaptive;
    console.log('ES6 ai_adaptive loaded successfully');
  } else {
    console.warn('ES6 ai_adaptive not found, using fallback');
    window.ai_adaptive = fallbacks.ai_adaptive;
    window.AI_REGISTRY.ai_adaptive = fallbacks.ai_adaptive;
  }

  console.log('AI bridge module initialized successfully');
} catch (error) {
  console.error('Failed to initialize AI bridge module:', error);

  // Initialize the AI registry if it doesn't exist
  if (!window.AI_REGISTRY) {
    window.AI_REGISTRY = {};
    console.log('Created global AI_REGISTRY in error handler');
  }

  // Provide fallback implementations to prevent game crashes
  window.ai_default = fallbacks.ai_default;
  window.ai_defensive = fallbacks.ai_defensive;
  window.ai_example = fallbacks.ai_example;
  window.ai_adaptive = fallbacks.ai_adaptive;

  // Also update the registry
  window.AI_REGISTRY.ai_default = fallbacks.ai_default;
  window.AI_REGISTRY.ai_defensive = fallbacks.ai_defensive;
  window.AI_REGISTRY.ai_example = fallbacks.ai_example;
  window.AI_REGISTRY.ai_adaptive = fallbacks.ai_adaptive;
}
