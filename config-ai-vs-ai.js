/**
 * AI vs AI Configuration
 *
 * This configuration sets up the game for AI vs AI (spectator) mode
 * where all players are controlled by AI.
 */
// Legacy configuration file - values will be merged by src/utils/config.js
window.GAME_CONFIG = {
  // Game rules
  playerCount: 7, // Number of AI players
  humanPlayerIndex: null, // null for AI vs AI mode (no human player)
  averageDicePerArea: 3, // Average dice per territory
  maxDice: 8, // Maximum dice per territory

  // AI configuration - all players use AI strategies
  aiAssignments: [
    'ai_default', // Player 0 - Default balanced AI
    'ai_defensive', // Player 1 - Defensive strategy
    'ai_defensive', // Player 2 - Defensive strategy
    'ai_adaptive', // Player 3 - Adaptive strategy
    'ai_default', // Player 4 - Default balanced AI
    'ai_default', // Player 5 - Default balanced AI
    'ai_default', // Player 6 - Default balanced AI
    'ai_default', // Player 7 - Default balanced AI
  ],

  // Spectator mode settings
  spectatorSpeedMultiplier: 2, // Speed up the game for spectating
};
