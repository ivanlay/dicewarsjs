/**
 * config.js - Configuration file for Dice Wars
 * 
 * This file contains configuration options for the Dice Wars game,
 * allowing customization of AI players and game settings.
 */

// AI Strategy Definitions
// Each AI function is imported from its own file and represents a different
// strategy that computer players can use.
var AI_STRATEGIES = {
    HUMAN: null,            // No AI - human controlled
    EXAMPLE: ai_example,    // Basic example AI with simple strategy
    DEFENSIVE: ai_defensive,// Defensive AI that focuses on safe attacks
    DEFAULT: ai_default     // Default balanced AI from original game
};

// Game Configuration
var GAME_CONFIG = {
    // Player count (2-8 players)
    playerCount: 7,
    
    // Human player index (0-7, or null for all AI)
    // Set to null for AI vs AI spectator mode
    humanPlayerIndex: 0,
    
    // AI assignments for each player position
    // Use the AI_STRATEGIES constants to assign strategies
    aiAssignments: [
        AI_STRATEGIES.DEFAULT,  // Player 0 (default AI when in spectator mode)
        AI_STRATEGIES.EXAMPLE,  // Player 1
        AI_STRATEGIES.DEFENSIVE,// Player 2
        AI_STRATEGIES.DEFENSIVE,// Player 3
        AI_STRATEGIES.DEFAULT,  // Player 4
        AI_STRATEGIES.DEFAULT,  // Player 5
        AI_STRATEGIES.DEFAULT,  // Player 6
        AI_STRATEGIES.DEFAULT   // Player 7
    ],
    
    // Average dice per territory (affects initial dice distribution)
    averageDicePerTerritory: 3,
    
    // Game speed multiplier (only affects spectator mode)
    // Values: 1 = normal speed, 2 = 2x speed, 3 = 3x speed, etc.
    spectatorSpeedMultiplier: 2
};

/**
 * Apply configuration to the game
 * @param {Game} game - The game object to configure
 */
function applyGameConfig(game) {
    // Set player count
    game.pmax = GAME_CONFIG.playerCount;
    
    // Set human player index
    game.user = GAME_CONFIG.humanPlayerIndex;
    
    // Set average dice per territory
    game.put_dice = GAME_CONFIG.averageDicePerTerritory;
    
    // Assign AI strategies to players
    for (var i = 0; i < 8; i++) {
        game.ai[i] = GAME_CONFIG.aiAssignments[i];
    }
    
    // Set spectator mode if no human player
    if (game.user === null) {
        spectate_mode = true;
        
        // Apply speed multiplier if configured (global variable)
        if (typeof GAME_CONFIG.spectatorSpeedMultiplier === 'number') {
            window.gameSpeedMultiplier = GAME_CONFIG.spectatorSpeedMultiplier;
        } else {
            window.gameSpeedMultiplier = 1;
        }
        
        // Ensure player 0 has an AI assigned if in spectator mode
        if (!game.ai[0]) {
            game.ai[0] = AI_STRATEGIES.DEFAULT;
        }
    } else {
        // If human player is assigned, make sure their AI is null
        game.ai[game.user] = null;
        window.gameSpeedMultiplier = 1;
    }
}