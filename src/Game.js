/**
 * Game.js - Core Game Logic for Dice Wars
 * 
 * This file contains the main game logic and data structures that power
 * the Dice Wars game. It handles map generation, game state, player turns,
 * area connections, and AI interfacing.
 */

import { AreaData, PlayerData, JoinData, HistoryData } from './models/index.js';
import { ai_default, ai_defensive, ai_example } from './ai/index.js';

/**
 * Game Class
 * 
 * The main game engine that manages:
 * - Map generation and territory layout
 * - Player turns and game state
 * - AI player behavior
 * - Attack resolution and dice mechanics
 * - Game history for replay
 */
export class Game {
  constructor() {
    /**
     * AI strategy array
     * 
     * Maps player indices to their AI strategy functions:
     * - Index 0 (null): Human player (no AI)
     * - Other indices: Different AI strategies imported from separate files
     * 
     * These functions are called during computer player turns to determine moves.
     */
    this.ai = [
      null,            // Player 0 (human player)
      ai_example,      // Player 1 - Example basic AI
      ai_defensive,    // Player 2 - Defensive strategy
      ai_defensive,    // Player 3 - Defensive strategy
      ai_default,      // Player 4 - Default balanced AI
      ai_default,      // Player 5 - Default balanced AI
      ai_default,      // Player 6 - Default balanced AI
      ai_default       // Player 7 - Default balanced AI
    ];

    //=============================================
    // GRID AND MAP PROPERTIES
    //=============================================
    
    // Map dimensions
    this.XMAX = 28;               // Width of map grid (cells)
    this.YMAX = 32;               // Height of map grid (cells)
    this.cel_max = this.XMAX * this.YMAX;  // Total number of cells
    this.cel = new Array(this.cel_max);    // Cell-to-area mapping
    
    // Adjacency mapping - which cells are neighbors to each cell
    this.join = new Array(this.cel_max);   // Contains adjacency data for each cell
    for (let i = 0; i < this.cel_max; i++) {
      this.join[i] = new JoinData();
      // Pre-compute all adjacent cells for quick lookup
      for (let j = 0; j < 6; j++) this.join[i].dir[j] = this.next_cel(i, j);
    }
    
    // Territory (area) data
    this.AREA_MAX = 32;          // Maximum number of distinct territories
    this.adat = new Array();    // Array of territory data
    for (let i = 0; i < 32; i++) this.adat[i] = new AreaData();
    
    //=============================================
    // MAP GENERATION VARIABLES
    //=============================================
    
    // Used for map creation algorithm
    this.num = new Array(this.cel_max);    // Cell serial numbers for randomization
    for (let i = 0; i < this.cel_max; i++) this.num[i] = i;
    this.rcel = new Array(this.cel_max);   // Cells available for territory expansion
    
    // Territory generation helpers
    this.next_f = new Array(this.cel_max);   // Peripheral cells used for territory growth
    this.alist = new Array(this.AREA_MAX);   // Working list of areas
    this.chk = new Array(this.AREA_MAX);     // Used for territory border drawing
    this.tc = new Array(this.AREA_MAX);      // Used for counting connected territories
    
    //=============================================
    // GAME STATE VARIABLES
    //=============================================
    
    // Game configuration
    this.pmax = 7;               // Number of players (default: 7)
    this.user = 0;               // Human player index (default: 0)
    this.put_dice = 3;           // Average number of dice per territory
    
    // Turn tracking
    this.jun = [0, 1, 2, 3, 4, 5, 6, 7]; // Player order array
    this.ban = 0;                        // Current turn index (current player = jun[ban])
    
    // Battle state
    this.area_from = 0;           // Attack source territory
    this.area_to = 0;             // Attack target territory
    this.defeat = 0;              // Attack result (0=failed, 1=succeeded)
    
    // Player state
    this.player = new Array(8);   // Player data objects
    this.STOCK_MAX = 64;          // Maximum dice reinforcements a player can have
    
    // AI helper arrays (used by computer players to track possible moves)
    this.list_from = new Array(this.AREA_MAX * this.AREA_MAX);  // Potential attacking territories
    this.list_to = new Array(this.AREA_MAX * this.AREA_MAX);    // Potential target territories
    
    //=============================================
    // HISTORY AND REPLAY SYSTEM
    //=============================================
    
    // Game action history
    this.his = new Array();       // Array of game actions (attacks/reinforcements)
    this.his_c = 0;               // Current history entry count
    
    // Initial game state for replay
    this.his_arm = new Array(this.AREA_MAX);   // Initial territory ownership
    this.his_dice = new Array(this.AREA_MAX);  // Initial dice counts

    // Initialize player data objects
    for (let i = 0; i < 8; i++) this.player[i] = new PlayerData();
  }

  /**
   * Get Adjacent Cell Index
   * 
   * Calculates the index of a neighboring cell in the specified direction.
   * Handles the offset pattern of the hexagonal grid layout.
   * 
   * @param {number} opos - Current cell index
   * @param {number} dir - Direction (0-5, see JoinData for numbering)
   * @returns {number} Index of adjacent cell or -1 if out of bounds
   */
  next_cel(opos, dir) {
    const ox = opos % this.XMAX;            // Get x coordinate from index
    const oy = Math.floor(opos / this.XMAX);  // Get y coordinate from index
    const f = oy % 2;                       // Is this an odd-numbered row? (for offset)
    let ax = 0;                             // x-offset to apply
    let ay = 0;                             // y-offset to apply
    
    // Calculate offset based on direction and row parity
    switch (dir) {
      case 0: ax = f; ay = -1; break;      // Upper right
      case 1: ax = 1; ay = 0; break;       // Right
      case 2: ax = f; ay = 1; break;       // Bottom right
      case 3: ax = f - 1; ay = 1; break;   // Bottom left
      case 4: ax = -1; ay = 0; break;      // Left
      case 5: ax = f - 1; ay = -1; break;  // Upper left
    }
    
    // Apply offset to get new coordinates
    const x = ox + ax;
    const y = oy + ay;
    
    // Check if the new coordinates are out of bounds
    if (x < 0 || y < 0 || x >= this.XMAX || y >= this.YMAX) return -1;
    
    // Convert coordinates back to cell index
    return y * this.XMAX + x;
  }

  /**
   * Initialize Game
   * 
   * Sets up a new game after the map has been created.
   * - Randomizes player turn order
   * - Initializes player data
   * - Sets up history tracking for replay
   * 
   * Note: Must be called after make_map() has generated the map.
   */
  start_game() {
    // Initialize and randomize player turn order
    for (let i = 0; i < 8; i++) this.jun[i] = i;  // Start with sequential ordering
    for (let i = 0; i < this.pmax; i++) {         // Shuffle the first pmax elements
      const r = Math.floor(Math.random() * this.pmax);
      const tmp = this.jun[i]; this.jun[i] = this.jun[r]; this.jun[r] = tmp;
    }
    this.ban = 0;  // Set current turn to first player in the order
    
    // Initialize player data objects
    for (let i = 0; i < 8; i++) this.player[i] = new PlayerData();
    
    // Calculate territory groups for each player
    for (let i = 0; i < 8; i++) this.set_area_tc(i);
    
    // Initialize history for replay
    this.his_c = 0;  // Reset history counter
    // Record initial state of each territory
    for (let i = 0; i < this.AREA_MAX; i++) {
      this.his_arm[i] = this.adat[i].arm;   // Initial ownership
      this.his_dice[i] = this.adat[i].dice; // Initial dice count
    }
  }

  /**
   * Calculate Connected Territory Groups
   * 
   * Finds the largest connected group of territories for a player.
   * Uses a union-find algorithm to identify connected components.
   * 
   * @param {number} pn - Player number/index
   */
  set_area_tc(pn) {
    this.player[pn].area_tc = 0;
    
    // Initialize each area as its own group (union-find algorithm)
    for (let i = 0; i < this.AREA_MAX; i++) this.chk[i] = i;
    
    // Combine adjacent areas owned by the same player into groups
    while (true) {
      let f = 0;  // Flag to track if any merges were made this iteration
      
      // Check each territory
      for (let i = 1; i < this.AREA_MAX; i++) {
        if (this.adat[i].size == 0) continue;       // Skip non-existent areas
        if (this.adat[i].arm != pn) continue;       // Skip areas not owned by player
        
        // Check against each other territory for adjacency
        for (let j = 1; j < this.AREA_MAX; j++) {
          if (this.adat[j].size == 0) continue;   // Skip non-existent areas
          if (this.adat[j].arm != pn) continue;   // Skip areas not owned by player
          if (this.adat[i].join[j] == 0) continue;  // Skip non-adjacent areas
          if (this.chk[j] == this.chk[i]) continue; // Skip if already in same group
          
          // Merge the groups by setting both to the smaller group number
          if (this.chk[i] > this.chk[j]) this.chk[i] = this.chk[j]; 
          else this.chk[j] = this.chk[i];
          
          f = 1;  // Set flag indicating that a merge occurred
        }
      }
      
      // If no merges occurred in this iteration, we're done
      if (f == 0) break;
    }
    
    // Count the size of each territory group
    for (let i = 0; i < this.AREA_MAX; i++) this.tc[i] = 0;
    
    // Count territories in each group
    for (let i = 1; i < this.AREA_MAX; i++) {
      if (this.adat[i].size == 0) continue;
      if (this.adat[i].arm != pn) continue;
      this.tc[this.chk[i]]++;  // Increment count for this territory's group
    }
    
    // Find the largest group
    for (let i = 0; i < this.AREA_MAX; i++) {
      if (this.player[pn].area_tc < this.tc[i]) {
        this.player[pn].area_tc = this.tc[i];
      }
    }
  }

  /**
   * Get current player number
   * 
   * @returns {number} Index of the current player
   */
  get_pn() {
    return this.jun[this.ban];
  }
}