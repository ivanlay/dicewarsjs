/**
 * AI Handler Module
 * 
 * Provides functions for AI execution, move validation, and AI management.
 * Extracted from Game.js for modularity.
 */

import { ai_default, ai_defensive, ai_example, ai_adaptive } from '../ai/index.js';

/**
 * AI Strategy Registry
 * 
 * Maps string AI strategy names to function references
 */
export const AI_REGISTRY = {
  ai_default,
  ai_defensive,
  ai_example,
  ai_adaptive
};

/**
 * Generate possible attack moves
 * 
 * Creates a list of all valid attack moves for a player.
 * Used by AI strategies to evaluate potential moves.
 * 
 * @param {Object} gameState - Game state including territories
 * @param {number} playerIndex - Player to generate moves for 
 * @returns {Array} List of possible attack moves with from/to territory pairs
 */
export function generatePossibleMoves(gameState, playerIndex) {
  const { adat, AREA_MAX } = gameState;
  const moves = [];
  
  // Loop through all territories
  for (let i = 1; i < AREA_MAX; i++) {
    // Skip non-existent or enemy territories
    if (adat[i].size === 0) continue;
    if (adat[i].arm !== playerIndex) continue;
    if (adat[i].dice <= 1) continue; // Need at least 2 dice to attack
    
    // Look for adjacent enemy territories to attack
    for (let j = 1; j < AREA_MAX; j++) {
      // Skip non-existent, own, or non-adjacent territories
      if (adat[j].size === 0) continue;
      if (adat[j].arm === playerIndex) continue;
      if (adat[i].join[j] === 0) continue;
      
      // Found a valid attack - add to moves list
      moves.push({
        from: i,
        to: j,
        attackerDice: adat[i].dice,
        defenderDice: adat[j].dice,
        ratio: adat[i].dice / adat[j].dice
      });
    }
  }
  
  return moves;
}

/**
 * Execute Computer Player Move
 * 
 * Delegates to the appropriate AI strategy function for the current player.
 * Each AI function receives the game state and returns its move decision.
 * 
 * @param {Object} gameState - Game state including AI array and current player
 * @returns {number} Return value from the AI (0 to end turn, non-zero to continue)
 */
export function executeAIMove(gameState) {
  const { ai, jun, ban } = gameState;
  
  // Look up the AI function for the current player
  const currentPlayer = jun[ban];
  const aiFunction = ai[currentPlayer];
  
  // Check if the AI function exists before calling it
  if (typeof aiFunction !== 'function') {
    console.error(`AI function not found for player ${currentPlayer}`);
    
    // Try to use default AI as a fallback
    if (typeof ai_default === 'function') {
      console.log('Using default AI as fallback');
      return ai_default(gameState);
    } else {
      // If no fallback available, end the turn
      console.error('No fallback AI available, ending turn');
      return 0;
    }
  }
  
  // Call the AI function, passing the game state
  return aiFunction(gameState);
}

/**
 * Set AI Strategies from Configuration
 * 
 * Updates the AI function array based on string identifiers from config.
 * 
 * @param {Object} gameState - Game state including AI array
 * @param {Array} aiTypes - Array of string AI type identifiers
 * @returns {Object} Updated game state with AI functions set
 */
export function configureAI(gameState, aiTypes) {
  if (!aiTypes || !Array.isArray(aiTypes)) {
    return gameState;
  }
  
  // Clone the game state to avoid mutation
  const updatedGameState = { ...gameState };
  
  // Loop through AI types and set corresponding functions
  for (let i = 0; i < aiTypes.length && i < updatedGameState.ai.length; i++) {
    const aiType = aiTypes[i];
    
    // Skip null entries (human players)
    if (aiType === null) {
      updatedGameState.ai[i] = null;
      continue;
    }
    
    // Map string names to the imported AI functions
    if (AI_REGISTRY[aiType]) {
      updatedGameState.ai[i] = AI_REGISTRY[aiType];
    } else {
      console.warn(`Unknown AI type: ${aiType}, using default AI`);
      updatedGameState.ai[i] = ai_default;
    }
  }
  
  return updatedGameState;
}