/**
 * Rendering Utilities Bridge Module
 * 
 * This is a bridge module that exports ES6 module functions to the global scope
 * for compatibility with the legacy code while enabling the incremental transition to ES6.
 */

// Import ES6 module implementations
import * as RenderUtils from '../utils/render.js';

// Export the color definitions to the global scope
window.COLORS = RenderUtils.COLORS;

// Export all functions to the global scope for legacy code compatibility
window.scaleValue = RenderUtils.scaleValue;
window.createText = RenderUtils.createText;
window.createButtonShape = RenderUtils.createButtonShape;
window.createButton = RenderUtils.createButton;
window.drawHexCell = RenderUtils.drawHexCell;
window.drawTerritory = RenderUtils.drawTerritory;
window.createDiceDisplay = RenderUtils.createDiceDisplay;
window.createDiceSpriteSheet = RenderUtils.createDiceSpriteSheet;
window.createPlayerStatus = RenderUtils.createPlayerStatus;
window.updatePlayerStatus = RenderUtils.updatePlayerStatus;

// Also export as ES6 module for new code
export * from '../utils/render.js';