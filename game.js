/**
 * game.js - Core Game Logic for Dice Wars
 * 
 * This file contains the main game logic and data structures that power
 * the Dice Wars game. It handles map generation, game state, player turns,
 * area connections, and AI interfacing.
 */

/**
 * Area Data Structure
 * 
 * Represents a territory on the game map. Contains information about:
 * - Size and position
 * - Ownership (player/army)
 * - Dice count
 * - Border information for rendering
 * - Adjacency to other territories
 */
var AreaData = function(){
	this.size=0;		// Size of area (0 = not present, >0 = number of cells)
	this.cpos=0;		// Center cell position (used for dice placement)
	this.arm=0;		    // Player/army affiliation (color)
	this.dice=0;		// Number of dice in this territory
	
	// Bounding box for determining center location
	this.left=0;        // Leftmost cell x-coordinate
	this.right=0;       // Rightmost cell x-coordinate 
	this.top=0;         // Topmost cell y-coordinate
	this.bottom=0;      // Bottommost cell y-coordinate
	this.cx=0;		    // Center x-coordinate (middle point between left and right)
	this.cy=0;		    // Center y-coordinate (middle point between top and bottom)
	this.len_min=0;     // Minimum distance to center (used for finding optimal center)

	// Border drawing information
	this.line_cel = new Array(100);	// Border cell indices
	this.line_dir = new Array(100);	// Border directions (0-5 for hexagonal grid)
	
	// Adjacency array - indices of areas that share a border with this area
	// Used for determining valid attack targets and territory groups
	this.join = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];	// 32 possible adjacent territories
}

/**
 * Player Data Structure
 * 
 * Tracks a player's game state, including:
 * - Territory ownership
 * - Dice counts and reinforcements
 * - Game ranking
 */
var PlayerData = function(){
	this.area_c=0;	    // Number of areas owned
	this.area_tc=0;	    // Size of largest connected territory group
	this.dice_c=0;	    // Total number of dice across all territories
	this.dice_jun=0;	// Dice count ranking among players
	this.stock=0;		// Reinforcement dice available for distribution
}

/**
 * Join Data Structure
 * 
 * Contains adjacency information for a cell in the hexagonal grid.
 * Each cell can have up to 6 neighbors in the directions:
 * 0=upper right, 1=right, 2=bottom right, 
 * 3=bottom left, 4=left, 5=upper left
 */
var JoinData = function(){
	this.dir = [0,0,0,0,0,0];  // Array of indices to adjacent cells
}

/**
 * History Data Structure
 * 
 * Records an action for replay and history tracking.
 * Each entry represents either an attack or a reinforcement.
 */
var HistoryData = function(){
	this.from=0;	// Source area (for attack or reinforcement)
	this.to=0;		// Target area (for attack) or 0 for reinforcement
	this.res=0;		// Result: 0=attack failed, 1=attack succeeded
}

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
var Game = function(){
	/**
	 * AI strategy array
	 * 
	 * Maps player indices to their AI strategy functions:
	 * - Index 0 (null): Human player (no AI)
	 * - Other indices: Different AI strategies imported from separate files
	 * 
	 * These functions are called during computer player turns to determine moves.
	 * Note: The AI functions are initialized in start_game to ensure they're available.
	 */
	this.ai = [null, null, null, null, null, null, null, null];
	
	// Initialize AI array will be properly set up in start_game

	var i,j;  // Loop counters used throughout the game logic

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
	this.next_cel = function( opos, dir ){
		var ox = opos%this.XMAX;              // Get x coordinate from index
		var oy = Math.floor(opos/this.XMAX);  // Get y coordinate from index
		var f = oy%2;                         // Is this an odd-numbered row? (for offset)
		var ax=0;                             // x-offset to apply
		var ay=0;                             // y-offset to apply
		
		// Calculate offset based on direction and row parity
		switch(dir){
			case 0: ax=f; ay=-1; break;      // Upper right
			case 1: ax=1; ay=0; break;       // Right
			case 2: ax=f; ay=1; break;       // Bottom right
			case 3: ax=f-1; ay=1; break;     // Bottom left
			case 4: ax=-1; ay=0; break;      // Left
			case 5: ax=f-1; ay=-1; break;    // Upper left
		}
		
		// Apply offset to get new coordinates
		var x = ox+ax;
		var y = oy+ay;
		
		// Check if the new coordinates are out of bounds
		if( x<0 || y<0 || x>=this.XMAX || y>=this.YMAX ) return -1;
		
		// Convert coordinates back to cell index
		return y*this.XMAX+x;
	}

	//=============================================
	// GRID AND MAP PROPERTIES
	//=============================================
	
	// Map dimensions
	this.XMAX=28;               // Width of map grid (cells)
	this.YMAX=32;               // Height of map grid (cells)
	this.cel_max = this.XMAX * this.YMAX;  // Total number of cells
	this.cel = new Array(this.cel_max);    // Cell-to-area mapping
	
	// Adjacency mapping - which cells are neighbors to each cell
	this.join = new Array(this.cel_max);   // Contains adjacency data for each cell
	for( i=0; i<this.cel_max; i++ ){
		this.join[i] = new JoinData();
		// Pre-compute all adjacent cells for quick lookup
		for( j=0; j<6; j++ ) this.join[i].dir[j] = this.next_cel(i,j);
	}
	
	// Territory (area) data
	this.AREA_MAX = 32;	        // Maximum number of distinct territories
	this.adat = new Array();    // Array of territory data
	for( i=0; i<32; i++ ) this.adat[i] = new AreaData();
	
	//=============================================
	// MAP GENERATION VARIABLES
	//=============================================
	
	// Used for map creation algorithm
	this.num = new Array(this.cel_max);    // Cell serial numbers for randomization
	for( i=0; i<this.cel_max; i++ ) this.num[i] = i;
	this.rcel = new Array(this.cel_max);   // Cells available for territory expansion
	
	// Territory generation helpers
	this.next_f = new Array(this.cel_max);	// Peripheral cells used for territory growth
	this.alist = new Array(this.AREA_MAX);	// Working list of areas
	this.chk = new Array(this.AREA_MAX);	// Used for territory border drawing
	this.tc = new Array(this.AREA_MAX);		// Used for counting connected territories
	
	//=============================================
	// GAME STATE VARIABLES
	//=============================================
	
	// Game configuration
	this.pmax=7;		        // Number of players (default: 7)
	this.user=0;		        // Human player index (default: 0)
	this.put_dice=3;	        // Average number of dice per territory
	
	// Turn tracking
	this.jun = [0,1,2,3,4,5,6,7]; // Player order array
	this.ban = 0;			      // Current turn index (current player = jun[ban])
	
	// Battle state
	this.area_from=0;	          // Attack source territory
	this.area_to=0;		          // Attack target territory
	this.defeat=0;		          // Attack result (0=failed, 1=succeeded)
	
	// Player state
	this.player = new Array(8);   // Player data objects
	this.STOCK_MAX=64;	          // Maximum dice reinforcements a player can have
	
	// AI helper arrays (used by computer players to track possible moves)
	this.list_from = new Array(this.AREA_MAX*this.AREA_MAX);  // Potential attacking territories
	this.list_to = new Array(this.AREA_MAX*this.AREA_MAX);    // Potential target territories
	
	//=============================================
	// HISTORY AND REPLAY SYSTEM
	//=============================================
	
	// Game action history
	this.his = new Array();       // Array of game actions (attacks/reinforcements)
	this.his_c = 0;               // Current history entry count
	
	// Initial game state for replay
	this.his_arm = new Array(this.AREA_MAX);   // Initial territory ownership
	this.his_dice = new Array(this.AREA_MAX);  // Initial dice counts
	
	/**
	 * Initialize Game
	 * 
	 * Sets up a new game after the map has been created.
	 * - Initializes AI functions for each player
	 * - Randomizes player turn order
	 * - Initializes player data
	 * - Sets up history tracking for replay
	 * 
	 * Note: Must be called after make_map() has generated the map.
	 */
	this.start_game = function(){
		var i;
		
		// Initialize AI strategy array - will be configured later if config is available
		// Default to a basic configuration that can be overridden
		if (!this.ai || this.ai.every(fn => fn === null)) {
			// Check if we're in spectator mode (user is null)
			if (this.user === null) {
				// All players should have AI in spectator mode
				this.ai = [
					window.ai_default,      // Player 0 - AI in spectator mode
					window.ai_defensive,    // Player 1 - Defensive strategy
					window.ai_defensive,    // Player 2 - Defensive strategy
					window.ai_defensive,    // Player 3 - Defensive strategy
					window.ai_default,      // Player 4 - Default balanced AI
					window.ai_default,      // Player 5 - Default balanced AI
					window.ai_default,      // Player 6 - Default balanced AI
					window.ai_default       // Player 7 - Default balanced AI
				];
			} else {
				// Normal mode with human player
				this.ai = [
					null,            		// Player 0 (human player by default)
					window.ai_defensive,    // Player 1 - Defensive strategy
					window.ai_defensive,    // Player 2 - Defensive strategy
					window.ai_defensive,    // Player 3 - Defensive strategy
					window.ai_default,      // Player 4 - Default balanced AI
					window.ai_default,      // Player 5 - Default balanced AI
					window.ai_default,      // Player 6 - Default balanced AI
					window.ai_default       // Player 7 - Default balanced AI
				];
			}
		}
		
		// Initialize and randomize player turn order
		for( i=0; i<8; i++ ) this.jun[i] = i;  // Start with sequential ordering
		for( i=0; i<this.pmax; i++ ){          // Shuffle the first pmax elements
			var r = Math.floor(Math.random()*this.pmax);
			var tmp=this.jun[i]; this.jun[i]=this.jun[r]; this.jun[r]=tmp;
		}
		this.ban = 0;  // Set current turn to first player in the order
		
		// Initialize player data objects
		for( i=0; i<8; i++ ) this.player[i] = new PlayerData();
		
		// Calculate territory groups for each player
		for( i=0; i<8; i++ ) this.set_area_tc(i);
		
		// Initialize history for replay
		this.his_c = 0;  // Reset history counter
		// Record initial state of each territory
		for( i=0; i<this.AREA_MAX; i++ ){
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
	this.set_area_tc = function( pn ){
		// Check if player index is valid and player exists to avoid undefined errors
		if (pn < 0 || pn >= this.player.length || !this.player[pn]) {
			return;
		}
		this.player[pn].area_tc = 0;
		var i,j;
		
		// Initialize each area as its own group (union-find algorithm)
		for( i=0; i<this.AREA_MAX; i++ ) this.chk[i] = i;
		
		// Combine adjacent areas owned by the same player into groups
		while( 1 ){
			var f = 0;  // Flag to track if any merges were made this iteration
			
			// Check each territory
			for( i=1; i<this.AREA_MAX; i++ ){
				if( this.adat[i].size == 0 ) continue;       // Skip non-existent areas
				if( this.adat[i].arm != pn ) continue;       // Skip areas not owned by player
				
				// Check against each other territory for adjacency
				for( j=1; j<this.AREA_MAX; j++ ){
					if( this.adat[j].size == 0 ) continue;   // Skip non-existent areas
					if( this.adat[j].arm != pn ) continue;   // Skip areas not owned by player
					if( this.adat[i].join[j]==0 ) continue;  // Skip non-adjacent areas
					if( this.chk[j] == this.chk[i] ) continue; // Skip if already in same group
					
					// Merge the groups by setting both to the smaller group number
					if( this.chk[i] > this.chk[j] ) this.chk[i]=this.chk[j]; 
					else this.chk[j]=this.chk[i];
					
					f = 1;  // Mark that we made a merge
					break;
				}
				if( f ) break;  // If we made a merge, restart the process
			}
			if( f==0 ) break;  // If no merges were made, we're done
		}
		
		// Count the territories in each group
		for( i=0; i<this.AREA_MAX; i++ ) this.tc[i]=0;
		for( i=1; i<this.AREA_MAX; i++ ){
			if( this.adat[i].size == 0 ) continue;
			if( this.adat[i].arm != pn ) continue;
			this.tc[this.chk[i]]++;  // Increment count for this group
		}
		
		// Find the largest group size
		var max = 0;
		for( i=0; i<this.AREA_MAX; i++ ){
			if( this.tc[i] > max ){
				max = this.tc[i];
			}
		}
		
		// Store the size of the largest connected group
		this.player[pn].area_tc = max;
	}
	
	/////////////////////////////////////////////////////////////////////
	/**
	 * Get Current Player Index
	 * 
	 * @returns {number} The index of the current player whose turn it is
	 */
	this.get_pn = function(){
		return this.jun[this.ban];  // Look up player index in turn order array
	}

	/**
	 * Generate Game Map
	 * 
	 * Creates a procedurally generated map with territories of varied sizes,
	 * ensuring good gameplay balance. The algorithm:
	 * 1. Creates territories using a growth algorithm
	 * 2. Establishes adjacency relationships
	 * 3. Distributes territories among players
	 * 4. Places initial dice
	 */
	this.make_map = function(){
		var i,j,k,c,an;
		
		//--------------------------------------------------------
		// RANDOMIZATION AND INITIALIZATION
		//--------------------------------------------------------
		
		// Randomize cell order for territory generation
		for( i=0; i<this.cel_max; i++ ){
			var r = Math.floor(Math.random()*this.cel_max);
			var tmp=this.num[i]; this.num[i]=this.num[r]; this.num[r]=tmp;
		}
		
		// Initialize all cells and adjacency data
		for( i=0; i<this.cel_max; i++ ){
			this.cel[i] = 0;           // No territory assigned yet
			this.rcel[i] = 0;	       // Not available for expansion yet
		}
		
		// Start the first territory (area number 1)
		var an = 1;	                   // Territory ID counter
		
		// Pick a random starting cell and mark it available for territory growth
		this.rcel[Math.floor(Math.random()*this.cel_max)] = 1;
		
		while( 1 ){
			// Determine penetration start cell
			var pos;
			var min = 9999;
			for( i=0; i<this.cel_max; i++ ){
				if( this.cel[i] > 0 ) continue;
				if( this.num[i] > min ) continue;
				if( this.rcel[i] == 0 ) continue;
				min = this.num[i];
				pos = i;
			}
			if( min == 9999 ) break;

			// Start penetration
			var ret = this.percolate( pos, 8, an );
			if( ret == 0 ) break;
			an++;
			if( an >= this.AREA_MAX ) break;
		}
		// Remove single-cell areas in sea
		for( i=0; i<this.cel_max; i++ ){
			if( this.cel[i] > 0 ) continue;
			var pos;
			var f = 0;
			var a = 0;
			for( k=0; k<6; k++ ){
				var pos = this.join[i].dir[k];
				if( pos<0 ) continue;
				if( this.cel[pos] == 0 ) f=1; else a=this.cel[pos];
			}
			if( f==0 ) this.cel[i] = a;
		}
		// Initialize area data
		for( i=0; i<this.AREA_MAX; i++ ) this.adat[i] = new AreaData();

		// Area size
		for( i=0; i<this.cel_max; i++ ){
			an = this.cel[i];
			if( an>0 ) this.adat[an].size++;
		}
		// Remove areas with size <= 10
		for( i=1; i<this.AREA_MAX; i++ ){
			if( this.adat[i].size <= 5 ) this.adat[i].size = 0;
		}
		for( i=0; i<this.cel_max; i++ ){
			an = this.cel[i];
			if( this.adat[an].size == 0 ) this.cel[i] = 0;
		}

		// Determine area center
		for( i=1; i<this.AREA_MAX; i++ ){
			this.adat[i].left = this.XMAX;
			this.adat[i].right = -1;
			this.adat[i].top = this.YMAX;
			this.adat[i].bottom = -1;
			this.adat[i].len_min = 9999;
		}
		c = 0;
		for( i=0; i<this.YMAX; i++ ){
			for( j=0; j<this.XMAX; j++ ){
				an = this.cel[c];
				if( an>0 ){
					if( j<this.adat[an].left ) this.adat[an].left = j;
					if( j>this.adat[an].right ) this.adat[an].right = j;
					if( i<this.adat[an].top ) this.adat[an].top = i;
					if( i>this.adat[an].bottom ) this.adat[an].bottom = i;
				}
				c++;
			}
		}
		for( i=1; i<this.AREA_MAX; i++ ){
			this.adat[i].cx = Math.floor(( this.adat[i].left + this.adat[i].right ) / 2);
			this.adat[i].cy = Math.floor(( this.adat[i].top + this.adat[i].bottom ) / 2);
		}
		c=0;
		var x,y,len;
		for( i=0; i<this.YMAX; i++ ){
			for( j=0; j<this.XMAX; j++ ){
				an = this.cel[c];
				if( an>0 ){
					// Distance from center (avoiding boundary lines)
					x = this.adat[an].cx-j; if( x<0 ) x = -x;
					y = this.adat[an].cy-i; if( y<0 ) y = -y;
					len = x+y;
					var f=0;
					for( k=0; k<6; k++ ){
						var pos = this.join[c].dir[k];
						if( pos>0 ){
							var an2 = this.cel[pos];
							if( an2 != an ){
								f=1;
								// Also create adjacency data
								this.adat[an].join[an2] = 1;
							}
						}
					}
					if( f ) len += 4;
					// Use closest point as center
					if( len < this.adat[an].len_min ){
						this.adat[an].len_min = len;
						this.adat[an].cpos = i*this.XMAX+j;
					}
				}
				c++;
			}
		}

		// Determine area army affiliation
		for( i=0; i<this.AREA_MAX; i++ ) this.adat[i].arm = -1;
		var arm=0;	// army affiliation
		var alist = new Array(this.AREA_MAX);	// area list
		while( 1 ){
			var c = 0;
			for( i=1; i<this.AREA_MAX; i++ ){
				if( this.adat[i].size == 0 ) continue;
				if( this.adat[i].arm >= 0 ) continue;
				alist[c] = i;
				c++;
			}
			if( c==0 ) break;
			var an = alist[Math.floor(Math.random()%c)];
			this.adat[an].arm = arm;
			arm++; if( arm>=this.pmax ) arm=0;
		}
		// Create area drawing line data
		for( i=0; i<this.AREA_MAX; i++ ) this.chk[i] = 0;
		for( i=0; i<this.cel_max; i++ ){
			var area = this.cel[i];
			if( area==0 ) continue;
			if( this.chk[area]>0 ) continue;
			for( var k=0; k<6; k++ ){
				if( this.chk[area]>0 ) break;
				var n = this.join[i].dir[k];
				if( n>=0 ){
					if(this.cel[n]!=area){
						this.set_area_line(i,k);
						this.chk[area]=1;
					}
				}
			}
		}
		// Place dice
		var anum = 0;
		for( i=1; i<this.AREA_MAX; i++ ){
			if( this.adat[i].size > 0 ){
				anum++;
				this.adat[i].dice = 1;
			}
		}
		anum *= (this.put_dice-1);
		var p=0;	// player
		for( i=0; i<anum; i++ ){
			var list = new Array(this.AREA_MAX);
			var c = 0;
			for( j=1; j<this.AREA_MAX; j++ ){
				if( this.adat[j].size == 0 ) continue;
				if( this.adat[j].arm != p ) continue;
				if( this.adat[j].dice >= 8 ) continue;
				list[c] = j;
				c++;
			}
			if( c==0 ) break;
			var an = list[Math.floor(Math.random()*c)];
			this.adat[an].dice++;
			p++; if( p>=this.pmax ) p=0;
		}
		for( i=0; i<this.AREA_MAX; i++ ){
//			this.adat[i].dice = 8;//1 + Math.floor(Math.random()*8);
		}
		
	}
	/**
	 * Grow a Territory
	 * 
	 * Creates a new territory by growing outward from a starting cell.
	 * Uses a greedy algorithm to select cells for inclusion in the territory.
	 * 
	 * @param {number} pt - Starting cell index
	 * @param {number} cmax - Target maximum size for the territory  
	 * @param {number} an - Territory ID to assign
	 * @returns {number} Number of cells in the created territory
	 */
	this.percolate = function( pt, cmax, an ){
		// Ensure minimum territory size
		if( cmax < 3 ) cmax = 3;

		var i,j,k;
		var opos = pt;	// Starting cell position
		
		// Initialize adjacency flags for all cells
		for(i=0; i<this.cel_max; i++ ) this.next_f[i]=0; 

		// Initial growth phase - add cells until target size or no more available
		var c = 0;  // Cell count
		while( 1 ){
			// Add current cell to territory
			this.cel[opos] = an;
			c++;
			
			// Mark all adjacent cells as candidates for growth
			for( i=0; i<6; i++ ){
				var pos = this.join[opos].dir[i];
				if( pos<0 ) continue;  // Skip out-of-bounds
				this.next_f[pos] = 1;  // Mark as adjacent
			}
			
			// Find best candidate cell to add next (lowest random priority number)
			var min = 9999;
			for( i=0; i<this.cel_max; i++ ){
				if( this.next_f[i] == 0 ) continue;  // Skip non-adjacent cells
				if( this.cel[i] > 0 ) continue;      // Skip cells already in territories
				if( this.num[i] > min ) continue;    // Skip cells with higher priority
				min = this.num[i];
				opos = i;  // This becomes the next cell to add
			}
			
			// Stop growing if no more cells are available or we've reached target size
			if( min == 9999 ) break;        // No more adjacent cells
			if( c >= cmax ) break;           // Reached target size
		}
		
		// Boundary smoothing - add all adjacent cells to avoid single-cell gaps
		for( i=0; i<this.cel_max; i++ ){
			if( this.next_f[i] == 0 ) continue;     // Skip non-adjacent cells
			if( this.cel[i] > 0 ) continue;         // Skip cells already in territories
			
			// Add this cell to the territory
			this.cel[i] = an;
			c++;
			
			// Mark cells adjacent to this one as candidates for the next territory
			for( k=0; k<6; k++ ){
				var pos = this.join[i].dir[k];
				if( pos<0 ) continue;  // Skip out-of-bounds
				this.rcel[pos] = 1;    // Mark as available for next territory
			}
		}
		
		return c;  // Return total number of cells in the territory
	}
	
	/**
	 * Generate Territory Border Data
	 * 
	 * Creates the data needed to draw a border around a territory.
	 * Uses a boundary-following algorithm to trace the perimeter.
	 * 
	 * @param {number} old_cel - Starting cell index
	 * @param {number} old_dir - Starting direction
	 */
	this.set_area_line = function( old_cel, old_dir ){
		var c = old_cel;              // Current cell
		var d = old_dir;              // Current direction
		var area = this.cel[c];	      // Territory ID
		var cnt = 0;                  // Border segment counter
		
		// Store the first border segment
		this.adat[area].line_cel[cnt] = c;
		this.adat[area].line_dir[cnt] = d;
		cnt++;
		
		// Follow the boundary until we return to starting point
		for( var i=0; i<100; i++ ){  // Safety limit of 100 segments
			// Move to next direction
			d++; if( d>=6 ) d=0;  // Direction wraps around 0-5
			
			// Check the cell in this direction
			var n = this.join[c].dir[d];
			if( n>=0 ){  // If not out of bounds
				if( this.cel[n] == area ){
					// If adjacent cell is same territory, move to that cell
					// and adjust direction to continue following the boundary
					c = n;
					d-=2; if( d<0 ) d+=6;  // Turn 120° counterclockwise
				}
			}
			
			// Store this border segment
			this.adat[area].line_cel[cnt] = c;
			this.adat[area].line_dir[cnt] = d;
			cnt++;
			
			// Stop if we've returned to the starting point
			if( c==old_cel && d==old_dir ) break;
		}
	}

	/**
	 * Execute Computer Player Move
	 * 
	 * Delegates to the appropriate AI strategy function for the current player.
	 * Each AI function receives the game state and returns its move decision.
	 * 
	 * @returns {number} Return value from the AI (0 to end turn, non-zero to continue)
	 */
	this.com_thinking = function() {
		// Get the current player number
		var currentPlayer = this.jun[this.ban];
		
		// Look up the AI function for the current player
		var ai_function = this.ai[currentPlayer];
		
		// If player 0 is configured as AI (humanPlayerIndex is null), use the aiTypes 
		// configuration to determine which AI function to use
		if (currentPlayer === 0 && window.GAME_CONFIG && window.GAME_CONFIG.humanPlayerIndex === null) {
			var aiType = window.GAME_CONFIG.aiTypes && window.GAME_CONFIG.aiTypes[currentPlayer];
			if (aiType && typeof window.getAIFunctionByName === 'function') {
				console.log('Using AI for player 0: ' + aiType);
				ai_function = window.getAIFunctionByName(aiType);
			}
		}
		
		// Check if the AI function exists before calling it
		if (typeof ai_function !== 'function') {
			console.error('AI function not found for player ' + currentPlayer);
			// Use default AI as a fallback if available
			if (typeof window.ai_default === 'function') {
				console.log('Using default AI as fallback');
				ai_function = window.ai_default;
			} else {
				// If no fallback available, end the turn
				console.error('No fallback AI available, ending turn');
				return 0;
			}
		}
		
		// Call the AI function, passing the game state
		return ai_function(this);
	}

	/**
	 * Record Action in History
	 * 
	 * Adds an entry to the game history for replay purposes.
	 * 
	 * @param {number} from - Source territory index
	 * @param {number} to - Target territory (or 0 for reinforcement)
	 * @param {number} res - Result (0=attack failed, 1=attack succeeded)
	 */
	this.set_his = function( from, to, res ){
		// Create a new history entry
		this.his[this.his_c] = new HistoryData();
		this.his[this.his_c].from = from;
		this.his[this.his_c].to = to;
		this.his[this.his_c].res = res;
		
		// Increment history counter
		this.his_c++;
	}
}
