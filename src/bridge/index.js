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

// Import all bridge modules
import './gameUtils.js';
import './render.js';
import './sound.js';
import './ai.js';

// Also export utility modules for ES6 usage
export * from '../utils/gameUtils.js';
export * from '../utils/render.js';
export * from '../utils/sound.js';
export * from '../utils/config.js';

// Export AI modules for ES6 usage
export * from '../ai/index.js';

// Log successful bridge initialization
console.log('ES6 utility and AI bridge modules loaded successfully');