/**
 * AI Bridge Module
 * 
 * This is a bridge module that exports ES6 module AI implementations to the global scope
 * for compatibility with the legacy code while enabling the incremental transition to ES6.
 */

// Import ES6 module implementations
import { ai_default, ai_defensive, ai_example, ai_adaptive } from '../ai/index.js';

// Export all AI functions to the global scope for legacy code compatibility
window.ai_default = ai_default;
window.ai_defensive = ai_defensive;
window.ai_example = ai_example;
window.ai_adaptive = ai_adaptive;

// Also export as ES6 module for new code
export { ai_default, ai_defensive, ai_example, ai_adaptive };