/**
 * AI Configuration Module
 *
 * Central configuration for all AI strategies in the game.
 * This module provides a registry of AI strategies, metadata,
 * and utility functions for accessing them.
 */

// Import the AI strategies
import { ai_default } from './ai_default.js';
import { ai_defensive } from './ai_defensive.js';
import { ai_example } from './ai_example.js';
import { ai_adaptive } from './ai_adaptive.js';

/**
 * AI Strategy Registry
 *
 * Contains all available AI strategies with metadata.
 * Each entry provides:
 * - id: Unique identifier string for the AI
 * - name: Human-readable name
 * - description: Brief description of the AI's strategy
 * - difficulty: Relative difficulty (1-5)
 * - implementation: The actual AI function
 */
export const AI_STRATEGIES = {
  // Default balanced AI
  ai_default: {
    id: 'ai_default',
    name: 'Balanced AI',
    description: 'A balanced approach that weighs attack and defense equally',
    difficulty: 3,
    implementation: ai_default,
  },

  // Defensive-focused AI
  ai_defensive: {
    id: 'ai_defensive',
    name: 'Defensive AI',
    description: 'Prioritizes protecting vulnerable territories',
    difficulty: 2,
    implementation: ai_defensive,
  },

  // Example simple AI
  ai_example: {
    id: 'ai_example',
    name: 'Basic AI',
    description: 'Simple implementation for educational purposes',
    difficulty: 1,
    implementation: ai_example,
  },

  // Adaptive AI that changes strategy
  ai_adaptive: {
    id: 'ai_adaptive',
    name: 'Adaptive AI',
    description: 'Adapts strategy based on game conditions',
    difficulty: 4,
    implementation: ai_adaptive,
  },
};

/**
 * Get AI information by ID
 * @param {string} aiId - The AI strategy ID
 * @returns {Object} AI strategy object with metadata and implementation
 */
export function getAIById(aiId) {
  return AI_STRATEGIES[aiId] || AI_STRATEGIES.ai_default;
}

/**
 * Get AI implementation function by ID
 * @param {string} aiId - The AI strategy ID
 * @returns {Function} The AI implementation function
 */
export function getAIImplementation(aiId) {
  return (AI_STRATEGIES[aiId] || AI_STRATEGIES.ai_default).implementation;
}

/**
 * Get all available AI strategies
 * @returns {Array} Array of AI strategy objects
 */
export function getAllAIStrategies() {
  return Object.values(AI_STRATEGIES);
}

/**
 * Default AI assignments
 * Maps player indices to AI strategy IDs
 */
export const DEFAULT_AI_ASSIGNMENTS = [
  'ai_adaptive', // Player 0 (human by default, AI in spectator mode)
  'ai_defensive', // Player 1
  'ai_defensive', // Player 2
  'ai_adaptive', // Player 3
  'ai_default', // Player 4
  'ai_default', // Player 5
  'ai_default', // Player 6
  'ai_default', // Player 7
];

/**
 * Create a mapping of player indices to AI implementation functions
 * @param {Array} aiAssignments - Array of AI strategy IDs for each player
 * @returns {Array} Array of AI implementation functions
 */
export function createAIFunctionMapping(aiAssignments = DEFAULT_AI_ASSIGNMENTS) {
  return aiAssignments.map(aiId => (aiId === null ? null : getAIImplementation(aiId)));
}

// Export the implementations directly as well for backward compatibility
export { ai_default, ai_defensive, ai_example, ai_adaptive };
