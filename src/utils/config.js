/**
 * Configuration Management Module
 * 
 * Provides utilities for game configuration:
 * - Default game settings
 * - Configuration loading and saving
 * - Dynamic configuration options
 */

/**
 * Default game configuration
 */
export const DEFAULT_CONFIG = {
  // Game rules
  playerCount: 7,         // Default number of players (including human)
  humanPlayerIndex: 0,    // Index of human player (0-7)
  averageDicePerArea: 3,  // Average dice per territory
  maxDice: 8,             // Maximum dice per territory
  
  // AI configuration
  aiTypes: [
    null,                 // Player 0 (human)
    'ai_example',         // Player 1
    'ai_defensive',       // Player 2  
    'ai_adaptive',        // Player 3
    'ai_default',         // Player 4
    'ai_default',         // Player 5
    'ai_default',         // Player 6
    'ai_default'          // Player 7
  ],
  
  // Display settings
  mapWidth: 28,           // Width of map grid (cells)
  mapHeight: 32,          // Height of map grid (cells)
  territoriesCount: 32,   // Maximum number of territories
  
  // Graphics settings
  displayScale: 1,        // Display scaling factor
  soundEnabled: true,     // Sound effects enabled
  
  // Display dimensions
  display: {
    viewWidth: 840,       // Canvas width
    viewHeight: 840,      // Canvas height
    cellWidth: 27,        // Cell width before scaling
    cellHeight: 18,       // Cell height before scaling
    messageYPos: 688,     // Y-position for messages
    armyYPos: 770         // Y-position for player status
  },
  
  // Spectator mode
  spectatorSpeedMultiplier: 2  // Speed multiplier for AI vs AI games
};

/**
 * Current active configuration
 */
let activeConfig = { ...DEFAULT_CONFIG };

/**
 * Get the current game configuration
 * @returns {Object} The current configuration object
 */
export function getConfig() {
  return { ...activeConfig };
}

/**
 * Update the game configuration
 * @param {Object} newConfig - New configuration settings to apply
 * @returns {Object} The updated configuration
 */
export function updateConfig(newConfig) {
  activeConfig = {
    ...activeConfig,
    ...newConfig,
    // Handle nested objects separately for deep merge
    display: {
      ...activeConfig.display,
      ...(newConfig?.display ?? {})
    }
  };
  
  // Save to localStorage if available
  try {
    localStorage?.setItem('dicewarsConfig', JSON.stringify(activeConfig));
  } catch (e) {
    console.warn('Failed to save configuration to localStorage', e);
  }
  
  return getConfig();
}

/**
 * Load configuration from localStorage if available
 * @returns {Object} The loaded or default configuration
 */
export function loadConfig() {
  try {
    const savedConfig = localStorage?.getItem('dicewarsConfig');
    if (savedConfig) {
      updateConfig(JSON.parse(savedConfig));
    }
  } catch (e) {
    console.warn('Failed to load configuration from localStorage', e);
  }
  return getConfig();
}

/**
 * Reset configuration to defaults
 * @returns {Object} The default configuration
 */
export function resetConfig() {
  activeConfig = { ...DEFAULT_CONFIG };
  
  // Clear from localStorage if available
  try {
    localStorage?.removeItem('dicewarsConfig');
  } catch (e) {
    console.warn('Failed to clear configuration from localStorage', e);
  }
  
  return getConfig();
}

/**
 * Apply configuration to a game instance
 * Legacy compatibility function for main.js
 * 
 * @param {Object} game - Game instance to configure
 */
export function applyGameConfig(game) {
  // Use the global GAME_CONFIG if available, or use activeConfig otherwise
  const config = window.GAME_CONFIG || activeConfig;
  
  // Apply simple config properties directly
  if (game) {
    try {
      if (config.humanPlayerIndex !== undefined) {
        game.user = config.humanPlayerIndex;
      }
      if (config.playerCount !== undefined) {
        game.pmax = config.playerCount;
      }
      
      // AI configuration for legacy game
      if (typeof game.start_game === 'function') {
        // The legacy game object has its own method to initialize AI
        // We'll handle this in start_game
      }
    } catch (e) {
      console.error('Error applying config to game object:', e);
    }
  }
  
  return game;
}

/**
 * Apply configuration to a game instance
 * @param {Game} game - The game instance to configure
 * @param {Object} [config=null] - Optional configuration to apply (uses active config if not provided)
 */
export function applyConfigToGame(game, config = null) {
  const cfg = config ?? activeConfig;
  
  // Game rules
  game.pmax = cfg.playerCount;
  game.user = cfg.humanPlayerIndex;
  game.put_dice = cfg.averageDicePerArea;
  
  // Map dimensions
  game.XMAX = cfg.mapWidth;
  game.YMAX = cfg.mapHeight;
  game.AREA_MAX = cfg.territoriesCount;
  
  // AI configuration - map string names to function references
  if (Array.isArray(cfg.aiTypes) && game.ai) {
    // Map AI type strings to actual functions
    for (let i = 0; i < cfg.aiTypes.length && i < game.ai.length; i++) {
      const aiType = cfg.aiTypes[i];
      // Skip null entries (human players)
      if (aiType === null) {
        game.ai[i] = null;
        continue;
      }
      
      // Map string names to the imported AI functions
      switch (aiType) {
        case 'ai_default':
          game.ai[i] = game.aiRegistry?.ai_default || window.ai_default;
          break;
        case 'ai_defensive':
          game.ai[i] = game.aiRegistry?.ai_defensive || window.ai_defensive;
          break;
        case 'ai_example':
          game.ai[i] = game.aiRegistry?.ai_example || window.ai_example;
          break;
        case 'ai_adaptive':
          game.ai[i] = game.aiRegistry?.ai_adaptive || window.ai_adaptive;
          break;
        default:
          console.warn(`Unknown AI type: ${aiType}, using default AI`);
          game.ai[i] = game.aiRegistry?.ai_default || window.ai_default;
      }
    }
  }
  
  return game;
}

// Initialize by loading any saved configuration
loadConfig();