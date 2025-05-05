window.GAME_CONFIG = { 
  // Game rules
  playerCount: 7,         // Default number of players (including human)
  humanPlayerIndex: 0,    // Index of human player (0-7), set to null for AI vs AI
  averageDicePerArea: 3,  // Average dice per territory
  maxDice: 8,             // Maximum dice per territory
  
  // AI configuration
  aiTypes: [
    'ai_adaptive',        // Player 0 (human by default, AI in spectator mode)
    'ai_example',         // Player 1
    'ai_defensive',       // Player 2  
    'ai_adaptive',        // Player 3
    'ai_default',         // Player 4
    'ai_default',         // Player 5
    'ai_default',         // Player 6
    'ai_default'          // Player 7
  ],
  
  // Spectator mode settings (when humanPlayerIndex is null)
  spectatorSpeedMultiplier: 2
};
