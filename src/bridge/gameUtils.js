/**
 * Game Utilities Bridge Module
 * 
 * This file serves as a bridge between ES6 modules and the legacy global variables code.
 * It exposes utility functions for game mechanics to the global scope.
 */

import { getConfig, updateConfig } from '../utils/config.js';
import { 
  initSoundSystem, 
  playSound, 
  stopSound, 
  stopAllSounds, 
  setVolume 
} from '../utils/sound.js';
import { 
  renderMap, 
  renderDice, 
  renderUI 
} from '../utils/render.js';

// Export configuration functions to global scope
window.getConfig = getConfig;
window.updateConfig = updateConfig;
window.applyGameConfig = function(gameInstance) {
  const config = getConfig();
  if (gameInstance && typeof gameInstance.applyConfig === 'function') {
    gameInstance.applyConfig(config);
  }
  return config;
};

// Export sound functions to global scope
window.initSoundSystem = initSoundSystem;
window.playSound = playSound;
window.stopSound = stopSound;
window.stopAllSounds = stopAllSounds;
window.setVolume = setVolume;

// Export rendering functions to global scope
window.renderMap = renderMap;
window.renderDice = renderDice;
window.renderUI = renderUI;

// Export common utility functions used by the original code
window.resize = function(n) {
  // This function is used in the original code to scale dimensions
  const scale = window.scale || { numerator: 1, denominator: 1 };
  return n * scale.numerator / scale.denominator;
};

// Export for ES6 module usage
export {
  getConfig,
  updateConfig,
  initSoundSystem,
  playSound,
  stopSound,
  stopAllSounds,
  setVolume,
  renderMap,
  renderDice,
  renderUI
};