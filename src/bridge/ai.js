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
  // Set AI functions with fallbacks
  window.ai_default = ai_default ?? fallbacks.ai_default;
  window.ai_defensive = ai_defensive ?? fallbacks.ai_defensive;
  window.ai_example = ai_example ?? fallbacks.ai_example;
  window.ai_adaptive = ai_adaptive ?? fallbacks.ai_adaptive;

  console.log('AI bridge module initialized successfully');
} catch (error) {
  console.error('Failed to initialize AI bridge module:', error);

  // Provide fallback implementations to prevent game crashes
  window.ai_default = fallbacks.ai_default;
  window.ai_defensive = fallbacks.ai_defensive;
  window.ai_example = fallbacks.ai_example;
  window.ai_adaptive = fallbacks.ai_adaptive;
}
