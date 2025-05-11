window.GAME_CONFIG = { 
  // Game rules
  playerCount: 7,         // Default number of players (including human)
  humanPlayerIndex: 0,    // Index of human player (0-7), set to null for AI vs AI
  averageDicePerArea: 3,  // Average dice per territory
  maxDice: 8,             // Maximum dice per territory
  
  // AI configuration - uses centralized system
  aiAssignments: [
    null,                 // Player 0 (human by default, null means human player)
    'ai_defensive',       // Player 1 - Defensive strategy
    'ai_defensive',       // Player 2 - Defensive strategy
    'ai_adaptive',        // Player 3 - Adaptive strategy
    'ai_default',         // Player 4 - Default balanced AI
    'ai_default',         // Player 5 - Default balanced AI
    'ai_default',         // Player 6 - Default balanced AI
    'ai_default'          // Player 7 - Default balanced AI
  ],
  
  // Spectator mode settings (when humanPlayerIndex is null)
  spectatorSpeedMultiplier: 2
};
