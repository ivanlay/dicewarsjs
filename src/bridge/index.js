/**
 * Bridge Module Index
 * 
 * This file serves as the main bridge between the ES6 module system and the legacy global scope.
 * It imports all bridge modules, which in turn expose ES6 module functionality to the global scope.
 * 
 * This approach allows us to:
 * 1. Incrementally migrate to ES6 modules
 * 2. Keep the legacy code functioning during transition
 * 3. Test new ES6 modules without disrupting the game
 */

// Import all bridge modules directly
import './gameUtils.js';
import './render.js';
import './sound.js';
import './ai.js';
import './Game.js';

// Export utility modules for ES6 usage
export * from '../utils/gameUtils.js';
export * from '../utils/render.js';
export * from '../utils/sound.js';
export * from '../utils/config.js';

// Export core modules for ES6 usage
export { Game } from '../Game.js';
// Import mechanics but only re-export non-conflicting parts
import * as Mechanics from '../mechanics/index.js';
// Selectively re-export to avoid conflicts
export const {
  makeMap, setAreaTc, 
  executeAttack, distributeReinforcements, setPlayerTerritoryData,
  executeAIMove, AI_REGISTRY
} = Mechanics;

// Export AI modules for ES6 usage
export * from '../ai/index.js';

// Track module loading status
const moduleStatus = {
  gameUtils: 'loaded',
  render: 'loaded',
  sound: 'loaded',
  ai: 'loaded',
  game: 'loaded'
};

// Add a check method to verify all modules are loaded
window.checkBridgeStatus = () => {
  console.log('Bridge module status:', moduleStatus);
  return moduleStatus;
};

// Set up error handlers for each module
window.addEventListener('error', (event) => {
  // Extract module name from error message or stack trace
  const errorModule = findModuleFromError(event.error || event.message);
  if (errorModule) {
    moduleStatus[errorModule] = 'failed';
    console.error(`Error in bridge module ${errorModule}:`, event.error || event.message);
  }
});

// Utility function to determine the module from an error
function findModuleFromError(error) {
  if (!error) return null;
  
  const errorString = error.toString ? error.toString() : String(error);
  const stack = error.stack || '';

  // Check if error mentions a specific module
  if (errorString.includes('gameUtils') || stack.includes('gameUtils')) {
    return 'gameUtils';
  } else if (errorString.includes('render') || stack.includes('render')) {
    return 'render';
  } else if (errorString.includes('sound') || stack.includes('sound')) {
    return 'sound';
  } else if (errorString.includes('ai') || stack.includes('ai')) {
    return 'ai';
  } else if (errorString.includes('Game') || stack.includes('Game')) {
    return 'game';
  }
  
  return null;
}

// Log bridge initialization
console.log('ES6 utility and AI bridge modules loaded successfully');