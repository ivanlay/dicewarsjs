/**
 * Render Bridge Module
 * 
 * This file serves as a bridge between ES6 modules and the legacy global variables code
 * for rendering functions.
 */

import { renderMap, renderDice, renderUI } from '../utils/render.js';

// Export rendering functions to global scope
window.renderMap = renderMap;
window.renderDice = renderDice;
window.renderUI = renderUI;

// Create helper functions to integrate with CreateJS
window.drawAreaShape = function(sprite, area, highlight = false) {
  if (typeof renderMap === 'function') {
    renderMap(sprite, area, highlight);
  }
};

window.drawAreaDice = function(sprite, area) {
  if (typeof renderDice === 'function') {
    renderDice(sprite, area);
  }
};

// Export for ES6 module usage
export {
  renderMap,
  renderDice,
  renderUI
};