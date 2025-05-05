/**
 * Main.js - Entry point for the Dice Wars game
 * 
 * Handles initialization, rendering, and UI interactions
 */
import { Game } from './Game.js';
import { 
  initSoundSystem, 
  playSound, 
  SOUND_MANIFEST, 
  preloadSounds 
} from './utils/sound.js';
import {
  loadConfig,
  applyConfigToGame,
  getConfig
} from './utils/config.js';
import { 
  renderMap, 
  renderDice, 
  renderUI,
  renderBattleAnimation
} from './utils/render.js';

// Global variables
let canvas, stage;        // CreateJS canvas and stage objects
let builder;              // CreateJS SpriteSheetBuilder for dice graphics
let touchdev = false;     // Flag indicating touch device detection

// Event handler functions - set dynamically based on game state
let timer_func = null;    // Called on each tick
let click_func = null;    // Called on mouse down
let move_func = null;     // Called on mouse move
let release_func = null;  // Called on mouse up
let waitcount = 0;        // Counter for timing/animation delays
let stat = 0;             // General state variable used in state machines

// Main game object - contains all game logic and state
// Ensure we have a Game constructor before trying to create an instance
let game;
try {
  // Check if Game constructor exists - should be provided by index.js exposing it to window
  if (typeof Game === 'function') {
    game = new Game();
    console.log('Created ES6 Game instance successfully');
  } else if (typeof window.Game === 'function') {
    // Fallback to global Game constructor if ES6 import isn't working
    game = new window.Game();
    console.log('Created Game instance from global constructor');
  } else {
    console.error('Game constructor is not defined! Check if game-loader.js is loaded properly.');
    // Create a temporary Game constructor to prevent errors
    console.warn('Creating temporary Game instance as fallback');
    game = {
      XMAX: 28,
      YMAX: 32,
      cel_max: 28 * 32,
      AREA_MAX: 32,
      pmax: 7
    };
  }
} catch (error) {
  console.error('Error creating Game instance:', error);
  // Create a minimal game object as fallback
  game = {
    XMAX: 28,
    YMAX: 32,
    cel_max: 28 * 32,
    AREA_MAX: 32,
    pmax: 7
  };
}

// Expose game to global scope for legacy code that might need it
window.game = game;

// Display position and scaling parameters
const original_config = {
    view_w: 840,
    view_h: 840,
    cel_w: 27,
    cel_h: 18,
    ypos_mes: 688,
    ypos_arm: 770
};  // Original size configuration

let scale_numerator = 1;        // Numerator for scaling ratio (scales up)
let scale_denominator = 1;      // Denominator for scaling ratio (scales down)
let view_w, view_h;             // Actual display dimensions after scaling
let cell_w, cell_h;             // Cell size after scaling (hexagonal grid cells)
let ypos_message;               // Y-position for messages and battle dice display
let ypos_army_status;           // Y-position for player status indicators
let dot_size;                   // Size of 1 dot after scaling (for line thickness)

// Arrays storing the pixel positions of each hexagonal cell
const cell_pos_x = [];  // X-coordinates of each cell
const cell_pos_y = [];  // Y-coordinates of each cell

// Main array containing all sprite objects
const sprites = [];

// Sprite indices - these are starting indices for different sprite categories
const SPRITE_INDEX = {
    AREA: 0,        // Area shapes (territories)
    FROM: 0,        // Highlight for attacking territory
    TO: 0,          // Highlight for defending territory
    DICE: 0,        // Dice display for each territory
    INFO: 0,        // First sprite index after map elements (UI elements start here)
    BAN: 0,         // Current player indicator
    PLAYER: 0,      // Player status indicators
    BATTLE: 0,      // Battle animation elements
    SUPPLY: 0,      // Reinforcement dice display
    GAMEOVER: 0,    // Game over screen
    WIN: 0,         // Victory screen
    TITLE: 0,       // Title screen
    PMAX: 0,        // Player count selection UI
    LOAD: 0,        // Loading indicator
    MES: 0,         // Message display
    BTN: 0,         // Button sprites
    MAX: 0          // Total number of sprites
};

// Area ordering and mapping arrays
const area_draw_priority = [];   // Display order of area dice (for proper z-ordering)
const area_num_to_sprite_num = []; // Maps area numbers to sprite indices for quick lookup

// Button system variables
let button_max = 0;              // Total number of buttons
let active_button_index = -1;    // Index of currently active button (-1 if none)
const button_functions = [];     // Array of button click handler functions

// Battle animation variables
class Battle {
    constructor() {
        this.dice_number_to_stop = 0;              // Dice number (position to stop)
        this.army_id = 0;                          // Player/army ID for dice color
        this.dice_count = 0;                       // Number of dice in the battle
        this.dice_values = [0, 0, 0, 0, 0, 0, 0, 0];  // Actual values rolled for each die
        this.roll_sum = 0;                         // Total sum of dice values
        this.finished_flags = [0, 0, 0, 0, 0, 0, 0, 0]; // Animation finished flags for each die
        this.dice_indices_to_use = [0, 1, 2, 3, 4, 5, 6, 7]; // Dice indices to use (shuffled for animation)
    }
}
const battle_data = [];        // Array holding Battle instances for attacker and defender
let battle_turn = 0;           // Battle animation turn (0 for attacker, 1 for defender)

// History replay system
let replay_counter = 0;        // Current step in history replay

// Game mode flags
let spectate_mode = false;     // Flag for spectator mode (AI vs AI)

// Sound system
let sound_on = true;           // Flag for sound enabled/disabled

/**
 * Utility function to apply scaling ratio to any number
 * @param {number} n - The number to scale
 * @returns {number} The scaled value
 */
function resize(n) {
    return n * scale_numerator / scale_denominator;
}

// Expose resize function to window for legacy code
window.resize = resize;

/**
 * Initialize the game on window load
 */
function init() {
    console.log('Initializing game...');
    
    // Load configuration
    const config = loadConfig();
    applyConfigToGame(game, config);
    
    // Initialize canvas
    canvas = document.getElementById("myCanvas");
    if (!canvas) {
        console.error("Cannot find canvas element with ID 'myCanvas'");
        return;
    }
    
    // Initialize CreateJS stage
    stage = new createjs.Stage(canvas);
    if (!stage) {
        console.error("Failed to create CreateJS stage");
        return;
    }
    
    stage.enableMouseOver();
    
    // Setup touch support
    if (createjs.Touch.isSupported()) {
        createjs.Touch.enable(stage);
        touchdev = true;
        
        // Touch devices may have autoplay restrictions
        if (touchdev) {
            sound_on = false;
        }
    }
    
    // Set up update tick
    createjs.Ticker.framerate = 60;
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", tick);
    
    // Initialize sound system
    if (initSoundSystem()) {
        preloadSounds();
    } else {
        console.warn("Sound system not available");
        sound_on = false;
    }
    
    // Calculate responsive scaling based on window dimensions
    calculateResponsiveScaling();
    
    // Apply scaling to display dimensions
    applyScalingToDisplayElements();
    
    // Initialize battle objects
    for (let i = 0; i < 2; i++) {
        battle_data[i] = new Battle();
    }
    
    // Set up event listeners
    canvas.addEventListener("mousedown", mouseDownListener);
    canvas.addEventListener("mousemove", mouseMoveListener);
    canvas.addEventListener("mouseup", mouseUpListener);
    window.addEventListener("resize", handleWindowResize);
    
    // Initialize UI elements - using setTimeout to ensure the bridge is initialized
    setTimeout(() => {
        console.log('Initializing game UI...');
        
        // Expose key variables to the global scope for legacy code
        window.canvas = canvas;
        window.stage = stage;
        window.sprites = sprites;
        window.SPRITE_INDEX = SPRITE_INDEX;
        window.cell_pos_x = cell_pos_x;
        window.cell_pos_y = cell_pos_y;
        window.area_draw_priority = area_draw_priority;
        window.area_num_to_sprite_num = area_num_to_sprite_num;
        window.button_functions = button_functions;
        window.timer_func = timer_func;
        window.click_func = click_func;
        window.move_func = move_func;
        window.release_func = release_func;
        window.scale_numerator = scale_numerator;
        window.scale_denominator = scale_denominator;
        window.cpos_x = cell_pos_x; // Legacy name
        window.cpos_y = cell_pos_y; // Legacy name
        window.spr = sprites; // Legacy name
        
        // Now call the legacy init function if it exists
        if (typeof window.init === 'function') {
            try {
                console.log('Calling legacy init function...');
                window.init();
            } catch (e) {
                console.error('Error in legacy init function:', e);
            }
        } else {
            console.log('No legacy init function found, starting title screen');
            // Start the title screen
            start_title_screen();
        }
    }, 100);
    
    console.log('Game initialization complete');
}

/**
 * Calculate responsive scaling based on window dimensions
 */
function calculateResponsiveScaling() {
    const inner_width = window.innerWidth;
    const inner_height = window.innerHeight;
    
    // Use the smaller ratio to ensure the game fits completely
    if (inner_width / original_config.view_w < inner_height / original_config.view_h) {
        // Width is the constraining factor
        scale_numerator = inner_width;
        scale_denominator = original_config.view_w;
    } else {
        // Height is the constraining factor
        scale_numerator = inner_height;
        scale_denominator = original_config.view_h;
    }
    
    // Expose scaling to global scope for legacy code
    window.nume = scale_numerator;
    window.deno = scale_denominator;
}

/**
 * Apply scaling to all display dimensions
 */
function applyScalingToDisplayElements() {
    view_w = Math.floor(original_config.view_w * scale_numerator / scale_denominator);
    view_h = Math.floor(original_config.view_h * scale_numerator / scale_denominator);
    
    // Set canvas dimensions
    canvas.width = view_w;
    canvas.height = view_h;
    
    // Apply scaling to other display elements
    cell_w = original_config.cel_w * scale_numerator / scale_denominator;
    cell_h = original_config.cel_h * scale_numerator / scale_denominator;
    ypos_message = original_config.ypos_mes * scale_numerator / scale_denominator;
    ypos_army_status = original_config.ypos_arm * scale_numerator / scale_denominator;
    dot_size = 1 * scale_numerator / scale_denominator;
    
    // Expose scaled dimensions to global scope for legacy code
    window.view_w = view_w;
    window.view_h = view_h;
    window.cel_w = cell_w; // Legacy name
    window.cel_h = cell_h; // Legacy name
    window.ypos_mes = ypos_message; // Legacy name
    window.ypos_arm = ypos_army_status; // Legacy name
    window.dot = dot_size; // Legacy name
    
    // Calculate hexagonal cell positions
    calculateHexCellPositions();
}

/**
 * Calculate positions for each hexagonal cell
 */
function calculateHexCellPositions() {
    let index = 0;
    for (let y = 0; y < game.YMAX; y++) {
        for (let x = 0; x < game.XMAX; x++) {
            cell_pos_x[index] = x * cell_w;
            // Offset every other row to create hexagonal grid pattern
            if (y % 2) {
                cell_pos_x[index] += cell_w / 2;
            }
            cell_pos_y[index] = y * cell_h;
            index++;
        }
    }
}

/**
 * Handle window resize event
 */
function handleWindowResize() {
    // Recalculate scaling
    calculateResponsiveScaling();
    applyScalingToDisplayElements();
    
    // Redraw all visible elements
    redrawGameElements();
}

/**
 * Redraw all visible game elements with new scaling
 */
function redrawGameElements() {
    stage.update();
}

/**
 * Initialize UI elements for the game
 */
function initializeGameUI() {
    // Use the legacy UI initialization code if available
    if (typeof window.fake_loading === 'function') {
        window.fake_loading();
    }
}

/**
 * Main update function - called on every animation frame
 * @param {Event} event - Tick event from CreateJS
 */
function tick(event) {
    try {
        // Call the current timer function if set
        if (timer_func !== null) {
            timer_func();
        }
        
        // Check button hover states - only if stage is defined
        if (stage) {
            check_button_hover();
        }
        
        // Update the stage if defined
        if (stage) {
            stage.update();
        }
    } catch (e) {
        console.error('Error in tick function:', e);
    }
}

/**
 * Check which button the mouse is hovering over
 */
function check_button_hover() {
    // Safety check for stage and other required variables
    if (!stage) {
        console.warn('Stage not defined in check_button_hover');
        return;
    }
    
    let new_active_button = -1;
    
    // If using the legacy code, defer to it if available
    if (typeof window.check_button_hover === 'function') {
        try {
            window.check_button_hover();
        } catch (e) {
            console.error('Error in legacy check_button_hover:', e);
        }
        return;
    }
    
    // Make sure sprites and SPRITE_INDEX are properly defined
    if (!sprites || !SPRITE_INDEX || typeof SPRITE_INDEX.BTN === 'undefined') {
        return;
    }
    
    // Otherwise use the ES6 version
    // Check each button for hover
    for (let i = 0; i < button_max; i++) {
        const sprite_index = SPRITE_INDEX.BTN + i;
        if (!sprites[sprite_index] || !sprites[sprite_index].visible) continue;
        
        try {
            // Convert mouse coordinates to button's local space
            const pt = sprites[sprite_index].globalToLocal(stage.mouseX, stage.mouseY);
            
            // Check if point is within button bounds
            if (sprites[sprite_index].hitTest(pt.x, pt.y)) {
                new_active_button = i;
                break;
            }
        } catch (e) {
            console.error('Error checking button hover state:', e);
        }
    }
    
    // If hover state hasn't changed, no need to update
    if (active_button_index === new_active_button) return;
    
    // Update active button index and appearance
    active_button_index = new_active_button;
    window.activebutton = active_button_index; // Update global for legacy
    
    // Update appearance of all buttons
    for (let i = 0; i < button_max; i++) {
        const button_sprite = sprites[SPRITE_INDEX.BTN + i];
        if (!button_sprite) continue;
        
        try {
            if (i === active_button_index) {
                // Pressed appearance for hovered button
                button_sprite.getChildAt(0).gotoAndStop("press");
            } else {
                // Normal appearance for non-hovered buttons
                button_sprite.getChildAt(0).gotoAndStop("btn");
            }
        } catch (e) {
            console.error('Error updating button appearance:', e);
        }
    }
}

/**
 * Mouse down event handler - routes to current click handler
 * @param {MouseEvent} e - Mouse event
 */
function mouseDownListener(e) {
    if (click_func !== null) {
        click_func(e);
    }
    if (canvas) {
        canvas.style.cursor = "default";
    }
}

/**
 * Mouse move event handler - routes to current move handler
 * @param {MouseEvent} e - Mouse event
 */
function mouseMoveListener(e) {
    if (move_func !== null) {
        move_func(e);
    }
    if (canvas) {
        canvas.style.cursor = "default";
    }
}

/**
 * Mouse up event handler - routes to current release handler
 * @param {MouseEvent} e - Mouse event
 */
function mouseUpListener(e) {
    if (release_func !== null) {
        release_func(e);
    }
    if (canvas) {
        canvas.style.cursor = "default";
    }
    
    // If a button is active when released, call its function
    if (active_button_index >= 0 && button_functions[active_button_index]) {
        playSound("snd_button");
        button_functions[active_button_index]();
    }
}

/**
 * Initialize the title screen display
 */
function start_title_screen() {
    console.log('Starting title screen');
    
    // If using legacy code, defer to it if available
    if (typeof window.start_title === 'function') {
        window.start_title();
        return;
    }
    
    // Hide all sprites initially
    for (let i = 0; i < SPRITE_INDEX.MAX; i++) {
        if (sprites[i]) sprites[i].visible = false;
    }
    
    // Update the stage
    stage.update();
    
    // Setup event handlers for title screen
    timer_func = null;
    click_func = null;
    move_func = null;
    release_func = null;
}

/**
 * Initialize the game - exported function that serves as the public API
 * This is called by the index.js entry point
 */
export function initGame() {
    // Initialize the game when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

// Export game instance and functions for testing and debugging
export { 
    game,
    sprites,
    stage,
    SPRITE_INDEX
};