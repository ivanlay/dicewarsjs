/**
 * AI Bridge Module
 *
 * This is a bridge module that exports ES6 module AI implementations to the global scope
 * for compatibility with the legacy code while enabling the incremental transition to ES6.
 */

// Import ES6 module implementations and configuration
import {
  AI_STRATEGIES,
  getAIById,
  getAIImplementation,
  getAllAIStrategies,
  createAIFunctionMapping,
  DEFAULT_AI_ASSIGNMENTS,
} from '@ai/index.js';

// Also export as ES6 module for new code
export {
  AI_STRATEGIES,
  getAIById,
  getAIImplementation,
  getAllAIStrategies,
  createAIFunctionMapping,
  DEFAULT_AI_ASSIGNMENTS,
};

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
(async () => {
  try {
    // Initialize the AI registry if it doesn't exist
    if (!window.AI_REGISTRY) {
      window.AI_REGISTRY = {};
      console.log('Created global AI_REGISTRY');
    }

    const exposeAI = async key => {
      try {
        const fn = await AI_STRATEGIES[key].loader();
        window[key] = fn;
        window.AI_REGISTRY[key] = fn;
        console.log(`ES6 ${key} loaded successfully`);
      } catch {
        console.warn(`ES6 ${key} not found, using fallback`);
        window[key] = fallbacks[key];
        window.AI_REGISTRY[key] = fallbacks[key];
      }
    };

    await Promise.all([
      exposeAI('ai_default'),
      exposeAI('ai_defensive'),
      exposeAI('ai_example'),
      exposeAI('ai_adaptive'),
    ]);

    // Expose the configuration utility functions
    window.AI_STRATEGIES = AI_STRATEGIES;
    window.DEFAULT_AI_ASSIGNMENTS = DEFAULT_AI_ASSIGNMENTS;
    window.getAIById = getAIById;
    window.getAIImplementation = getAIImplementation;
    window.getAllAIStrategies = getAllAIStrategies;
    window.createAIFunctionMapping = createAIFunctionMapping;

    console.log('AI bridge module initialized successfully with configuration utilities');
  } catch (error) {
    console.error('Failed to initialize AI bridge module:', error);

    if (!window.AI_REGISTRY) {
      window.AI_REGISTRY = {};
      console.log('Created global AI_REGISTRY in error handler');
    }

    window.ai_default = fallbacks.ai_default;
    window.ai_defensive = fallbacks.ai_defensive;
    window.ai_example = fallbacks.ai_example;
    window.ai_adaptive = fallbacks.ai_adaptive;

    window.AI_REGISTRY.ai_default = fallbacks.ai_default;
    window.AI_REGISTRY.ai_defensive = fallbacks.ai_defensive;
    window.AI_REGISTRY.ai_example = fallbacks.ai_example;
    window.AI_REGISTRY.ai_adaptive = fallbacks.ai_adaptive;

    window.AI_STRATEGIES = {};
    window.DEFAULT_AI_ASSIGNMENTS = [];
    window.getAIById = fallbacks.ai_default;
    window.getAIImplementation = fallbacks.ai_default;
    window.getAllAIStrategies = () => [];
    window.createAIFunctionMapping = () => [];
  }
})();
