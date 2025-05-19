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
// Import debug tools (conditionally active in development mode)
import './debugTools.js';
// Import mechanics but only re-export non-conflicting parts
import * as Mechanics from '@mechanics/index.js';

// Export utility modules for ES6 usage
export * from '@utils/gameUtils.js';
export * from '@utils/render.js';
export * from '@utils/sound.js';
export * from '@utils/config.js';
export * from '@utils/debugTools.js';

// Export core modules for ES6 usage
export { Game } from '../Game.js';
// Selectively re-export to avoid conflicts
export const {
  makeMap,
  setAreaTc,
  executeAttack,
  distributeReinforcements,
  setPlayerTerritoryData,
  executeAIMove,
  AI_REGISTRY,
} = Mechanics;

// Export AI modules for ES6 usage
export * from '@ai/index.js';

// Track module loading status
const moduleStatus = {
  gameUtils: 'loaded',
  render: 'loaded',
  sound: 'loaded',
  ai: 'loaded',
  game: 'loaded',
  debugTools: process.env.NODE_ENV !== 'production' ? 'loaded' : 'not loaded (production)',
};

// Add a check method to verify all modules are loaded
window.checkBridgeStatus = () => {
  console.log('Bridge module status:', moduleStatus);
  return moduleStatus;
};

// Set up error handlers for each module
window.addEventListener('error', event => {
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
  }
  if (errorString.includes('render') || stack.includes('render')) {
    return 'render';
  }
  if (errorString.includes('sound') || stack.includes('sound')) {
    return 'sound';
  }
  if (errorString.includes('ai') || stack.includes('ai')) {
    return 'ai';
  }
  if (errorString.includes('Game') || stack.includes('Game')) {
    return 'game';
  }
  if (errorString.includes('debugTools') || stack.includes('debugTools')) {
    return 'debugTools';
  }

  return null;
}

// Add a global verification that can be called to check if ES6 modules loaded properly
window.ES6_LOADED = true;
window.verifyES6BridgeStatus = () => {
  console.log('Checking ES6 Bridge Status:');
  console.log('- Global ES6_LOADED flag:', window.ES6_LOADED);
  console.log('- Module status:', moduleStatus);

  // Check each AI function to see if it's the fallback or ES6 version
  const aiDefault = window.ai_default?.toString().includes('placeholder') ? 'Fallback' : 'ES6';
  const aiDefensive = window.ai_defensive?.toString().includes('placeholder') ? 'Fallback' : 'ES6';
  const aiExample = window.ai_example?.toString().includes('placeholder') ? 'Fallback' : 'ES6';
  const aiAdaptive = window.ai_adaptive?.toString().includes('placeholder') ? 'Fallback' : 'ES6';

  console.log('- AI Functions:');
  console.log('  - ai_default:', aiDefault);
  console.log('  - ai_defensive:', aiDefensive);
  console.log('  - ai_example:', aiExample);
  console.log('  - ai_adaptive:', aiAdaptive);

  return {
    loaded: window.ES6_LOADED,
    moduleStatus,
    aiStatus: { aiDefault, aiDefensive, aiExample, aiAdaptive },
  };
};

// Log bridge initialization with timestamp
console.log(`[${new Date().toISOString()}] ES6 utility and AI bridge modules loaded successfully`);
