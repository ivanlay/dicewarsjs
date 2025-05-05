/**
 * Game Loader
 * 
 * This script ensures all necessary components are loaded in the correct order
 * before game initialization begins.
 */

// Global object to track initialization state
window.DiceWars = window.DiceWars || {
  initialized: false,
  ready: false
};

// Define Battle class for legacy code
// Battle animation class - holds data for dice battle visualization
window.Battle = function() {
  this.dn = 0;                    // Dice number (position to stop)
  this.arm = 0;                   // Player/army ID for dice color
  this.dmax = 0;                  // Number of dice in the battle
  this.deme = [0,0,0,0,0,0,0,0];  // Actual values rolled for each die
  this.sum = 0;                   // Total sum of dice values
  this.fin = [0,0,0,0,0,0,0,0];   // Animation finished flags for each die
  this.usedice = [0,1,2,3,4,5,6,7]; // Dice indices to use (shuffled for animation)
};

// Function to initialize the game in the correct order
function initializeGame() {
  console.log('Initializing game components in proper sequence');
  
  // Make sure createjs is loaded
  if (typeof createjs === 'undefined') {
    console.error('CreateJS not loaded! Cannot continue.');
    return;
  }
  
  // 1. First ensure Game constructor is defined globally
  if (typeof window.Game === 'undefined') {
    console.log('Game constructor not found, defining bridge class');
    
    // Create a temporary Game constructor to prevent errors
    // This will be replaced by the proper bridge later
    window.Game = function() {
      this.XMAX = 28;
      this.YMAX = 32;
      this.cel_max = this.XMAX * this.YMAX;
      this.AREA_MAX = 32;
      this.pmax = 7;
      // Add other required properties
      console.log('Temporary Game instance created');
    };
  }
  
  // 2. Make sure essential global objects are defined
  if (typeof window.stage === 'undefined') {
    console.log('Stage not defined, creating placeholder');
    window.canvas = document.getElementById('myCanvas');
    if (window.canvas) {
      window.stage = new createjs.Stage(window.canvas);
    }
  }
  
  // 3. Ensure org object is defined for layout scaling
  if (typeof window.org === 'undefined') {
    console.log('Org not defined, creating default scaling values');
    window.org = {
      view_w: 840,
      view_h: 840,
      cel_w: 27,
      cel_h: 18,
      ypos_mes: 688,
      ypos_arm: 770
    };
  }
  
  // 4. Set up other essential globals required by legacy code
  window.timer_func = window.timer_func || null;  // Called on each tick
  window.click_func = window.click_func || null;  // Called on mouse down
  window.move_func = window.move_func || null;    // Called on mouse move
  window.release_func = window.release_func || null; // Called on mouse up
  window.waitcount = window.waitcount || 0;      // Counter for timing/animation delays
  window.stat = window.stat || 0;               // General state variable used in state machines
  window.battle = window.battle || [];         // Array of battle data
  window.activebutton = window.activebutton || -1; // Active button index
  window.btn_func = window.btn_func || [];     // Button functions
  
  // Create prio array if it doesn't exist
  window.prio = window.prio || [];
  
  // Mark as initialized
  window.DiceWars.initialized = true;
}

// Wait for DOM to be ready before checking dependencies
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM ready, preparing game initialization');
  initializeGame();
});