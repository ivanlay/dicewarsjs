/**
 * Rendering Utilities Bridge Module
 * 
 * This is a bridge module that exports ES6 module functions to the global scope
 * for compatibility with the legacy code while enabling the incremental transition to ES6.
 */

// Import ES6 module implementations
import * as RenderUtils from '../utils/render.js';

// Also export as ES6 module for new code
export * from '../utils/render.js';

// Default colors if not available in the module
const defaultColors = {
  BACKGROUND: '#222222',
  TERRITORY: ['#DD4444', '#44DD44', '#4444DD', '#DDDD44', '#DD44DD', '#44DDDD'],
  TEXT: '#FFFFFF',
  BUTTON: '#666666',
  BUTTON_HOVER: '#888888'
};

// Create fallback implementations
const fallbacks = {
  scaleValue: (value) => { 
    console.error('scaleValue not found in RenderUtils module'); 
    return value; 
  },
  createText: () => { 
    console.error('createText not found in RenderUtils module'); 
    return null; 
  },
  createButtonShape: () => { 
    console.error('createButtonShape not found in RenderUtils module'); 
    return null; 
  },
  createButton: () => { 
    console.error('createButton not found in RenderUtils module'); 
    return null; 
  },
  drawHexCell: () => { 
    console.error('drawHexCell not found in RenderUtils module'); 
    return null; 
  },
  drawTerritory: () => { 
    console.error('drawTerritory not found in RenderUtils module'); 
    return null; 
  },
  createDiceDisplay: () => { 
    console.error('createDiceDisplay not found in RenderUtils module'); 
    return null; 
  },
  createDiceSpriteSheet: () => { 
    console.error('createDiceSpriteSheet not found in RenderUtils module'); 
    return null; 
  },
  createPlayerStatus: () => { 
    console.error('createPlayerStatus not found in RenderUtils module'); 
    return null; 
  },
  updatePlayerStatus: () => { 
    console.error('updatePlayerStatus not found in RenderUtils module'); 
  }
};

// Export all functions to the global scope for legacy code compatibility
try {
  // Export the color definitions to the global scope
  window.COLORS = RenderUtils.COLORS || defaultColors;
  
  // Export all functions to the global scope for legacy code compatibility with fallbacks
  window.scaleValue = RenderUtils.scaleValue || fallbacks.scaleValue;
  window.createText = RenderUtils.createText || fallbacks.createText;
  window.createButtonShape = RenderUtils.createButtonShape || fallbacks.createButtonShape;
  window.createButton = RenderUtils.createButton || fallbacks.createButton;
  window.drawHexCell = RenderUtils.drawHexCell || fallbacks.drawHexCell;
  window.drawTerritory = RenderUtils.drawTerritory || fallbacks.drawTerritory;
  window.createDiceDisplay = RenderUtils.createDiceDisplay || fallbacks.createDiceDisplay;
  window.createDiceSpriteSheet = RenderUtils.createDiceSpriteSheet || fallbacks.createDiceSpriteSheet;
  window.createPlayerStatus = RenderUtils.createPlayerStatus || fallbacks.createPlayerStatus;
  window.updatePlayerStatus = RenderUtils.updatePlayerStatus || fallbacks.updatePlayerStatus;
  
  console.log('Render utilities bridge module initialized successfully');
} catch (error) {
  console.error('Failed to initialize render utilities bridge module:', error);
  
  // Provide fallback implementations to prevent game crashes
  window.COLORS = defaultColors;
  window.scaleValue = fallbacks.scaleValue;
  window.createText = fallbacks.createText;
  window.createButtonShape = fallbacks.createButtonShape;
  window.createButton = fallbacks.createButton;
  window.drawHexCell = fallbacks.drawHexCell;
  window.drawTerritory = fallbacks.drawTerritory;
  window.createDiceDisplay = fallbacks.createDiceDisplay;
  window.createDiceSpriteSheet = fallbacks.createDiceSpriteSheet;
  window.createPlayerStatus = fallbacks.createPlayerStatus;
  window.updatePlayerStatus = fallbacks.updatePlayerStatus;
}