/**
 * Bridge Index Module
 * 
 * Central export point for the bridge between ES6 modules and legacy global variables code.
 * This module initializes the bridge and exposes all components for import by the main application.
 */

// Import all bridge components
import { game, Game } from './Game.js';
import { 
  ai_default, 
  ai_defensive, 
  ai_example, 
  ai_adaptive 
} from './ai.js';
import {
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
} from './gameUtils.js';

// Required for sound
import * as sound from '../utils/sound.js';

// Initialize global scaling for responsive design
window.scale = {
  numerator: 1,
  denominator: 1
};

// Initialize essential global objects if not defined
// This ensures that even if the order is wrong, these will be available
if (typeof window.canvas === 'undefined' && document.getElementById('myCanvas')) {
  window.canvas = document.getElementById('myCanvas');
}

if (typeof window.stage === 'undefined' && typeof createjs !== 'undefined') {
  window.stage = new createjs.Stage(window.canvas);
}

// Initialize bridge by exposing a global initializeBridge function
window.initializeBridge = function() {
  console.log('Initializing bridge between ES6 modules and legacy code');
  
  // Make sure Game constructor is defined globally
  if (typeof window.Game !== 'function') {
    console.log('Re-exposing Game constructor to global scope');
    window.Game = Game;
    window.game = game;
  }
  
  // Make sure canvas and stage are defined
  if (typeof window.canvas === 'undefined' && document.getElementById('myCanvas')) {
    window.canvas = document.getElementById('myCanvas');
  }
  
  if (typeof window.stage === 'undefined' && typeof createjs !== 'undefined' && window.canvas) {
    window.stage = new createjs.Stage(window.canvas);
  }
  
  // Set up handlers to update global scaling
  const updateScaling = () => {
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    const original = { width: 840, height: 840 };
    
    // Use the smaller ratio to ensure the game fits completely
    if (innerWidth / original.width < innerHeight / original.height) {
      // Width is the constraining factor
      window.scale.numerator = innerWidth;
      window.scale.denominator = original.width;
    } else {
      // Height is the constraining factor
      window.scale.numerator = innerHeight;
      window.scale.denominator = original.height;
    }
    
    console.log('Updated scale:', window.scale);
  };
  
  // Update scaling on initialization and on window resize
  updateScaling();
  window.addEventListener('resize', updateScaling);
  
  // Mark the bridge as initialized for other modules
  window.DiceWars = window.DiceWars || {};
  window.DiceWars.bridgeInitialized = true;
  
  return {
    game,
    initialized: true
  };
};

// Export all components for ES6 module usage
export {
  game,
  Game,
  ai_default,
  ai_defensive,
  ai_example,
  ai_adaptive,
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