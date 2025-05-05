/**
 * Game.js Bridge Module
 * 
 * This file serves as a bridge between ES6 modules and the legacy global variables code.
 * It exposes the Game class and related game mechanics to the global scope
 * so that legacy code can access it.
 */

import { Game } from '../Game.js';

// Create a Game constructor function compatible with the original code
function GameConstructor() {
  console.log('GameConstructor called from bridge');
  
  // Initialize properties that need to be available in the global namespace
  this.XMAX = 28;
  this.YMAX = 32;
  this.cel_max = this.XMAX * this.YMAX;
  this.cel = new Array(this.cel_max);
  this.join = new Array(this.cel_max);
  this.AREA_MAX = 32;
  this.adat = [];
  this.num = new Array(this.cel_max);
  this.rcel = new Array(this.cel_max);
  this.next_f = new Array(this.cel_max);
  this.alist = new Array(this.AREA_MAX);
  this.chk = new Array(this.AREA_MAX);
  this.tc = new Array(this.AREA_MAX);
  this.pmax = 7;
  this.user = 0;
  this.put_dice = 3;
  this.jun = [0, 1, 2, 3, 4, 5, 6, 7];
  this.ban = 0;
  this.area_from = 0;
  this.area_to = 0;
  this.defeat = 0;
  this.player = new Array(8);
  this.STOCK_MAX = 64;
  this.list_from = new Array(this.AREA_MAX * this.AREA_MAX);
  this.list_to = new Array(this.AREA_MAX * this.AREA_MAX);
  this.his = [];
  this.his_c = 0;
  this.his_arm = new Array(this.AREA_MAX);
  this.his_dice = new Array(this.AREA_MAX);
  
  // Initialize modern Game instance
  this._gameImpl = new Game();
  
  // Copy properties from ES6 Game to the global object
  Object.assign(this, this._gameImpl);
  
  // Make methods available that the original code expects
  this.make_map = function() {
    console.log('Bridge: make_map() called');
    this._gameImpl.make_map();
    // Copy updated properties to the global object
    Object.assign(this, this._gameImpl);
  };
  
  this.start_game = function() {
    console.log('Bridge: start_game() called');
    this._gameImpl.start_game();
    // Copy updated properties to the global object
    Object.assign(this, this._gameImpl);
  };
  
  // Other game methods
  this.get_pn = function() { return this._gameImpl.get_pn(); };
  this.com_thinking = function() { return this._gameImpl.com_thinking(); };
  this.set_his = function(from, to, res) { return this._gameImpl.set_his(from, to, res); };
  this.attack = function(fromArea, toArea) { return this._gameImpl.attack(fromArea, toArea); };
  this.distributeReinforcements = function(playerIndex) { return this._gameImpl.distributeReinforcements(playerIndex); };
  this.applyConfig = function(config) { return this._gameImpl.applyConfig(config); };
  this.set_area_tc = function(pn) { return this._gameImpl.set_area_tc(pn); };
  this.next_cel = function(opos, dir) { return this._gameImpl.next_cel(opos, dir); };

  console.log('Legacy Game constructor initialized via bridge');
  return this;
}

// Immediately instantiate a game instance to ensure it's available globally
const gameInstance = new GameConstructor();

// Define Game constructor in the global scope immediately, overriding any temporary version
// This ensures it's available for main.js
window.Game = GameConstructor;

// Expose game instance globally immediately
window.game = gameInstance;

// Make sure the org object is defined for layout scaling
if (typeof window.org === 'undefined') {
  console.log('Setting up global org object for scaling');
  window.org = {
    view_w: 840,
    view_h: 840,
    cel_w: 27,
    cel_h: 18,
    ypos_mes: 688,
    ypos_arm: 770
  };
}

// Export for ES6 module usage
export { gameInstance as game, GameConstructor as Game };