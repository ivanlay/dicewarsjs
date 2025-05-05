/**
 * AI Bridge Module
 * 
 * This file serves as a bridge between ES6 modules and the legacy global variables code.
 * It exposes the AI functions to the global scope for legacy code to access.
 */

import { 
  ai_default, 
  ai_defensive, 
  ai_example, 
  ai_adaptive 
} from '../ai/index.js';

// Expose AI functions to the global scope
window.ai_default = ai_default;
window.ai_defensive = ai_defensive;
window.ai_example = ai_example;
window.ai_adaptive = ai_adaptive;

// For legacy code that might check for existence of these functions
if (typeof window.GAME_CONFIG === 'undefined') {
  window.GAME_CONFIG = {
    humanPlayerIndex: 0,
    playerCount: 7,
    averageDicePerArea: 3
  };
}

// Export for ES6 module usage
export {
  ai_default,
  ai_defensive,
  ai_example,
  ai_adaptive
};