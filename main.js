var canvas, stage;        // CreateJS canvas and stage objects
var builder;              // CreateJS SpriteSheetBuilder for dice graphics
var touchdev = false;     // Flag indicating touch device detection

// Event handler functions - set dynamically based on game state
var timer_func = new Function();	timer_func = null;    // Called on each tick
var click_func = new Function();	click_func = null;      // Called on mouse down
var move_func = new Function();		move_func = null;       // Called on mouse move
var release_func = new Function();	release_func = null;   // Called on mouse up
var waitcount=0;          // Counter for timing/animation delays
var stat=0;               // General state variable used in state machines

// Main game object - contains all game logic and state
var game = new Game();

// Apply configuration if available
if (typeof applyGameConfig === 'function') {
    // ES6 modules might not be loaded yet, so we'll apply this later
    window.pendingGameConfig = true;
    // Apply immediately for environments without ES6 modules
    try {
        applyGameConfig(game);
    } catch (e) {
        console.warn('applyGameConfig failed during init:', e);
    }
}

// Display position and scaling parameters
var org = {view_w:840,view_h:840,cel_w:27,cel_h:18,ypos_mes:688,ypos_arm:770};	// Original size configuration
var nume = 1;        // Numerator for scaling ratio (scales up)
var deno = 1;        // Denominator for scaling ratio (scales down)
var view_w,view_h;   // Actual display dimensions after scaling
var cel_w,cel_h;	 // Cell size after scaling (hexagonal grid cells)
var ypos_mes;		 // Y-position for messages and battle dice display
var ypos_arm;		 // Y-position for player status indicators
var dot;			 // Size of 1 dot after scaling (for line thickness)

// Arrays storing the pixel positions of each hexagonal cell
var cpos_x = new Array();  // X-coordinates of each cell
var cpos_y = new Array();  // Y-coordinates of each cell

// Main array containing all sprite objects
var spr = new Array();

// Sprite indices - these are starting indices for different sprite categories
var sn_area = 0;       // Area shapes (territories)
var sn_from = 0;       // Highlight for attacking territory
var sn_to = 0;         // Highlight for defending territory
var sn_dice = 0;       // Dice display for each territory
var sn_info = 0;       // First sprite index after map elements (UI elements start here)
var sn_ban = 0;        // Current player indicator
var sn_player = 0;     // Player status indicators
var sn_battle = 0;     // Battle animation elements
var sn_supply = 0;     // Reinforcement dice display
var sn_gameover = 0;   // Game over screen
var sn_win = 0;        // Victory screen
var sn_title = 0;      // Title screen
var sn_pmax = 0;       // Player count selection UI
var sn_load = 0;       // Loading indicator
var sn_mes = 0;        // Message display
var sn_btn = 0;        // Button sprites
var sn_max = 0;        // Total number of sprites

// Area ordering and mapping arrays
var prio = new Array();		// Display order of area dice (for proper z-ordering)
var an2sn = new Array();	// Maps area numbers to sprite indices for quick lookup

// Button system variables
var bmax = 0;              // Total number of buttons
var activebutton = -1;     // Index of currently active button (-1 if none)
var btn_func = new Array(); // Array of button click handler functions

// Battle animation class - holds data for dice battle visualization
var Battle = function(){
	this.dn = 0;	                // Dice number (position to stop)
	this.arm = 0;	                // Player/army ID for dice color
	this.dmax = 0;	                // Number of dice in the battle
	this.deme = [0,0,0,0,0,0,0,0];  // Actual values rolled for each die
	this.sum = 0;                    // Total sum of dice values
	this.fin = [0,0,0,0,0,0,0,0];	// Animation finished flags for each die
	this.usedice = [0,1,2,3,4,5,6,7]; // Dice indices to use (shuffled for animation)
}
var battle = new Array();   // Array holding Battle instances for attacker and defender
var bturn = 0;	            // Battle animation turn (0 for attacker, 1 for defender)

// History replay system
var replay_c = 0;           // Current step in history replay

// Game mode flags
var spectate_mode = false;  // Flag for spectator mode (AI vs AI)

// Sound system
var soundon = true;         // Flag for sound enabled/disabled
var manifest = [            // Sound file manifest for CreateJS sound system
	{"src":"./sound/button.wav",	"id":"snd_button"},  // Button click
	{"src":"./sound/clear.wav",		"id":"snd_clear"},   // Victory sound
	{"src":"./sound/click.wav",		"id":"snd_click"},   // Area selection
	{"src":"./sound/dice.wav",		"id":"snd_dice"},    // Dice roll
	{"src":"./sound/fail.wav",		"id":"snd_fail"},    // Attack failed
	{"src":"./sound/myturn.wav",	"id":"snd_myturn"},  // Player turn notification
	{"src":"./sound/over.wav",		"id":"snd_over"},    // Game over
	{"src":"./sound/success.wav",	"id":"snd_success"}  // Attack succeeded
];

// Utility function to apply scaling ratio to any number
function resize(n){
	return n*nume/deno;
}

// Application initialization on page load
window.addEventListener("load", init);
function init() {
	var i,j,c,n;

	// Set up CreateJS canvas and stage
	canvas = document.getElementById("myCanvas");
	stage = new createjs.Stage(canvas);
	
	// Clear the stage to fix any visual glitches
	stage.removeAllChildren();
	
	// Enable touch support if available and disable sound on touch devices
	if(createjs.Touch.isSupported() == true) {
	   createjs.Touch.enable(stage);
	   touchdev = true;
	}
	if( touchdev ){
		soundon = false;  // Disable sound on touch devices to prevent autoplay restrictions
	}
	
	// Calculate responsive scaling based on window dimensions
	// Uses the smaller ratio to ensure the game fits completely within the window
	var iw = window.innerWidth;
	var ih = window.innerHeight;
	if( iw/org.view_w < ih/org.view_h ){
		// Width is the constraining factor
		nume = iw;
		deno = org.view_w;
	}else{
		// Height is the constraining factor
		nume = ih;
		deno = org.view_h;
	}
	
	// Apply scaling to all display dimensions
	view_w = Math.floor(org.view_w*nume/deno);
	view_h = Math.floor(org.view_h*nume/deno);
	stage.canvas.width = view_w;
	stage.canvas.height = view_h;
	cel_w = org.cel_w*nume/deno;
	cel_h = org.cel_h*nume/deno;
	ypos_mes = org.ypos_mes*nume/deno;
	ypos_arm = org.ypos_arm*nume/deno;
	dot = 1*nume/deno;
	
	// Initialize battle objects for attacker and defender
	for( i=0; i<2; i++ ) battle[i] = new Battle();

	// Current sprite index counter for initialization
	var sn = 0;

	// Calculate pixel positions for each hexagonal cell in the grid
	c=0;
	for( i=0; i<game.YMAX; i++ ){
		for( j=0; j<game.XMAX; j++ ){
			cpos_x[c] = j*cel_w;
			// Offset every other row to create hexagonal grid pattern
			if( i%2 ) cpos_x[c] += cel_w/2;
			cpos_y[c] = i*cel_h;
			c++;
		}
	}
	
	// Create territory shape sprites - includes normal territories plus attack highlights
	sn_area = sn;  // Store starting index of area shapes
	for( i=0; i<game.AREA_MAX+2; i++ ){
		spr[sn] = new createjs.Shape();
		// Position the map in the center of the screen
		spr[sn].x = view_w/2-game.XMAX*cel_w/2-cel_w/4;
		spr[sn].y = 50*nume/deno;  // Top margin
		stage.addChild(spr[sn]);
		sn++;
	}
	// Set indices for the attack highlight shapes (source and target)
	sn_from = sn_area + game.AREA_MAX;	// Sprite for highlighting attacking territory
	sn_to = sn_area + game.AREA_MAX+1;	// Sprite for highlighting defending territory
	
	// Create dice sprites for each territory
	sn_dice = sn;  // Store starting index of dice sprites
	
	// Create spritesheet for dice graphics
	builder = new createjs.SpriteSheetBuilder();
	var mc = new lib.areadice();  // Reference to dice movieclip from the library
	var rect = new createjs.Rectangle(0,0,80,100);  // Size of dice sprite
	builder.addMovieClip(mc, rect, nume/deno);  // Add to builder with scaling
	var spritesheet = builder.build();
	
	// Create sprites for each territory's dice
	for( i=0; i<game.AREA_MAX; i++ ){
		spr[sn] = new createjs.Sprite(spritesheet);
		stage.addChild(spr[sn]);
		sn++;
	}
	
	// Initialize area display order array (for proper z-ordering of dice)
	for( i=0; i<game.AREA_MAX; i++ ){
		prio[i] = new Object();
		prio[i].an = i;  // Area number
		prio[i].cpos = 0;  // Center position (will be set later during map generation)
	}
	
	// Store index where UI elements start (after map elements)
	sn_info = sn;
	
	// Create current player indicator sprite
	sn_ban = sn;
	spr[sn] = new lib.mc();  // Current player indicator graphic
	stage.addChild(spr[sn]);
	spr[sn].scaleX = nume/deno;
	spr[sn].scaleY = nume/deno;
	sn++;
	
	// Create player status display sprites (one for each possible player)
	sn_player = sn;
	for( i=0; i<8; i++ ){
		// Create player icon
		var pd = new lib.mc();  // Player dice icon
		pd.scaleX = pd.scaleY = 0.12;
		pd.x = -22;
		pd.y = 0;
		
		// Create container for player status elements
		spr[sn] = new createjs.Container();
		spr[sn].addChildAt(pd,0);
		
		// Add territory count text
		var txt = new createjs.Text("", "32px Anton", "Black")
		txt.textBaseline = "middle";
		txt.x = 5;
		spr[sn].addChildAt(txt,1);
		
		// Add reinforcement count text
		var txt2 = new createjs.Text("", "16px Anton", "Black")
		txt2.textBaseline = "middle";
		txt2.x = 5;
		txt2.y = 28;
		spr[sn].addChildAt(txt2,2);
		
		// Add to stage and apply scaling
		stage.addChild(spr[sn]);
		spr[sn].scaleX = nume/deno;
		spr[sn].scaleY = nume/deno;
		sn++;
	}
	
	// Create battle animation container and elements
	sn_battle = sn;
	spr[sn] = new createjs.Container();
	spr[sn].y = ypos_mes;
	spr[sn].x = view_w/2;
	spr[sn].scaleX = spr[sn].scaleY = nume/deno;
	
	// Semi-transparent white background for battle display
	var bgshape = new createjs.Shape();
	bgshape.graphics.beginFill("rgba(255,255,255,0.8)").drawRect(-org.view_w/2,-50,org.view_w,360);
	spr[sn].addChild(bgshape);
	
	// Create dice shadows and dice for both attacker (i=0) and defender (i=1)
	for( i=0; i<2; i++ ){
		// Create shadow sprites for visual effect
		for( j=0; j<8; j++ ){
			var bs = new lib.mc();  // Dice shadow
			bs.scaleX = bs.scaleY = 0.15;
			bs.name = "s"+i+j;      // Name format: s[player][index]
			spr[sn].addChild(bs);
		}
		
		// Create dice sprites
		for( j=0; j<8; j++ ){
			var bd = new lib.mc();  // Actual dice
			bd.scaleX = bd.scaleY = 0.15;
			bd.name = "d"+i+j;      // Name format: d[player][index]
			spr[sn].addChild(bd);
		}
		
		// Create text to display total dice value
		var txt = new createjs.Text("37", "80px Anton", "Black")
		txt.textBaseline = "middle";
		txt.textAlign = "center";
		txt.name = "n"+i;          // Name format: n[player]
		spr[sn].addChild(txt);
	}
	stage.addChild(spr[sn]);
	sn++;
	
	// Create reinforcement dice display (for supply phase)
	sn_supply = sn;
	spr[sn] = new createjs.Container();
	spr[sn].y = ypos_mes;
	spr[sn].x = view_w/2;
	spr[sn].scaleX = spr[sn].scaleY = nume/deno;
	
	// Create sprites for each possible reinforcement die
	for( i=0; i<game.STOCK_MAX; i++ ){
		var sd = new lib.mc();  // Dice sprite
		var w = 40;             // Base spacing unit
		
		// Calculate position in a staggered grid pattern
		sd.x = -(6.5*w)+Math.floor(i/4)*w -(i%4)*w*0.5;  // X position with offset by row
		sd.y = -w*0.7+Math.floor(i%4)*w/2;               // Y position in rows
		
		// Initialize with blank dice
		sd.gotoAndStop("d00");
		sd.scaleX = sd.scaleY = 0.1;
		spr[sn].addChildAt(sd,i);
	}
	stage.addChild(spr[sn]);
	sn++;

	// Create Game Over screen
	sn_gameover = sn;
	spr[sn] = new createjs.Container();
	spr[sn].x = view_w/2;  // Center horizontally
	spr[sn].y = view_h/2;  // Center vertically
	spr[sn].scaleX = spr[sn].scaleY = nume/deno;
	
	// Black semi-transparent background
	var goshape = new createjs.Shape();
	goshape.graphics.beginFill("#000000").drawRect(-org.view_w/2+10,-180,org.view_w-20,360);
	goshape.name = "bg";  // Named for animation access
	spr[sn].addChild(goshape);
	
	// Game Over text
	var gotext = new createjs.Text("G A M E O V E R", "80px Anton", "White")
	gotext.textBaseline = "middle";
	gotext.textAlign = "center";
	gotext.name = "mes";  // Named for animation access
	spr[sn].addChild(gotext);
	stage.addChild(spr[sn]);
	sn++;
	
	// Create Victory screen
	sn_win = sn;
	spr[sn] = new lib.mc();  // Uses movieclip from library
	spr[sn].scaleX = spr[sn].scaleY = nume/deno;
	stage.addChild(spr[sn]);
	sn++;
	
	// Create title screen
	sn_title = sn;
	spr[sn] = new lib.mc();  // Uses movieclip from library
	spr[sn].scaleX = spr[sn].scaleY = nume/deno;
	stage.addChild(spr[sn]);
	sn++;
	
	// Create player count selection UI
	sn_pmax = sn;
	spr[sn] = new createjs.Container();
	
	// Create text elements for each player count option (2-8 players)
	for( i=0; i<7; i++ ){
		var ptxt = new createjs.Text((i+2)+" players",Math.floor(32*nume/deno)+"px Anton", "#aaaaaa");
		ptxt.name = "p"+i;  // Named for access during selection
		
		// Position in a grid pattern
		ptxt.x = view_w/2 -280*nume/deno + Math.floor(i%4)*(180*nume/deno);  // Horizontal position by column
		ptxt.y = view_h*0.8 + Math.floor(i/4)*(60*nume/deno);                // Vertical position by row
		
		// Centered text alignment
		ptxt.textAlign = "center";
		ptxt.textBaseline = "middle";
		spr[sn].addChild(ptxt);
	}
	stage.addChild(spr[sn]);
	sn++;
	
	// Create loading text (also helps load the web font)
	sn_load = sn;
	spr[sn] = new createjs.Text("Now loading...", Math.floor(24*nume/deno)+"px Anton", "#000000");
	stage.addChild(spr[sn]);
	sn++;

	// Create generic message display text
	sn_mes = sn;
	spr[sn] = new createjs.Text("Now loading...", Math.floor(30*nume/deno)+"px Roboto", "#000000");
	spr[sn].textAlign = "center";
	spr[sn].textBaseline = "middle";
	stage.addChild(spr[sn]);
	sn++;
	
	// Create game buttons
	var btxt = ["START","AI vs AI","YES","NO","END TURN","TITLE","HISTORY","SPECTATE"];
	bmax = btxt.length;  // Store total number of buttons
	sn_btn = sn;         // Store starting index of button sprites
	
	// Create each button
	for( i=0; i<bmax; i++ ){
		// Create button container
		spr[sn] = new createjs.Container();
		
		// Add button background
		var bt = new lib.mc();
		bt.gotoAndStop("btn");  // Set to button graphic state
		spr[sn].addChildAt(bt,0);
		
		// Add button text
		var txt = new createjs.Text(btxt[i], "32px Anton", "Black")
		txt.textAlign = "center";
		txt.textBaseline = "middle";
		spr[sn].addChildAt(txt,1);
		
		// Add to stage and apply scaling
		stage.addChild(spr[sn]);
		spr[sn].scaleX = nume/deno;
		spr[sn].scaleY = nume/deno;
		spr[sn].visible = true;
		sn++;
		
		// Initialize button click handler (will be set later)
		btn_func[i] = new Function();
		btn_func[i] = null;
	}

	// Store total number of sprites and hide them all initially
	sn_max = sn;
	for( i=0; i<sn_max; i++ ) spr[i].visible = false;
	
	// Set up event listeners
	stage.addEventListener("stagemousedown", mouseDownListner );  // Mouse down events
	stage.addEventListener("stagemousemove", mouseMoveListner );  // Mouse move events
	stage.addEventListener("stagemouseup", mouseUpListner );      // Mouse up events
	createjs.Ticker.addEventListener("tick", onTick);             // Animation tick
	createjs.Ticker.framerate = 60;                              // Set frame rate
	
	// Initialize sound system if enabled
	if( soundon ){
		// Create sound loading queue (for non-touch devices)
		var queue = new createjs.LoadQueue(false);
		queue.installPlugin(createjs.Sound);
		queue.loadManifest(manifest,true);
		queue.addEventListener("fileload",handleFileLoad);    // Handle each loaded sound
		queue.addEventListener("complete",handleComplete);    // Handle loading completion
		
		// Add click handler to initialize AudioContext on user gesture
		document.addEventListener('click', function initAudioContext() {
			if (createjs && createjs.Sound && createjs.Sound.context && 
				createjs.Sound.context.state !== 'running') {
				createjs.Sound.context.resume().then(() => {
					console.log('AudioContext started on user gesture');
				});
			}
			// Only remove the listener once we've successfully started the context
			if (createjs && createjs.Sound && createjs.Sound.context && 
				createjs.Sound.context.state === 'running') {
				document.removeEventListener('click', initAudioContext);
			}
		});
	}else{
		// Skip sound loading and go directly to fake loading screen
		waitcount = 60;
		timer_func = fake_loading;
	}
}

// Handle individual sound file loading completion
function handleFileLoad(event){
	var item = event.item;
	if( item.type == createjs.LoadQueue.SOUND ){
		startSound(item.id);  // Create sound instance
	}	
}

// Handle all sound files loading completion
function handleComplete(event){
	waitcount = 30;
	timer_func = fake_loading;  // Start fake loading animation
}

// Array to store sound instances
var instance = new Array();

// Create instance of a sound for later playback
function startSound(soundid){
	instance[soundid] = createjs.Sound.createInstance(soundid);
}

// Play a sound effect with the given ID
function playSound(soundid){
	if( !soundon ) return;  // Skip if sound is disabled
	// Check if sound instance exists
	if (!instance[soundid]) {
		console.warn(`Sound instance not found: ${soundid}. Creating new instance.`);
		startSound(soundid);
	}
	// Now attempt to play it
	if (instance[soundid]) {
		// Use modern volume property instead of deprecated setVolume method
		instance[soundid].volume = 0.5;  // Set volume to 50%
		instance[soundid].play();  // Play the sound
	} else {
		console.error(`Cannot play sound: ${soundid}`);
	}
}

////////////////////////////////////////////////////
// Event listeners and main game loop
////////////////////////////////////////////////////

// Handle mouse button press
function mouseDownListner(e) {
	click_func?.(e);  // Call current click handler if set
	canvas.style.cursor="default";  // Reset mouse cursor
}

// Handle mouse movement
function mouseMoveListner(e) {
	move_func?.(e);  // Call current move handler if set
	canvas.style.cursor="default";  // Reset mouse cursor
}

// Handle mouse button release
function mouseUpListner(e) {
	release_func?.(e);  // Call current release handler if set
	canvas.style.cursor="default";  // Reset mouse cursor
	
	// If a button is active when released, call its function
	if( activebutton >= 0 ){
		if( btn_func[activebutton] ){
			playSound("snd_button");  // Play button sound
			
			// Special check for the TITLE button in spectator mode
			if (activebutton === 5 && spectate_mode) {
				// Ensure we're using the correct function
				btn_func[5] = start_title;
				// Reset spectator mode before going to title
				spectate_mode = false;
			}
			
			// Call the button's function
			btn_func[activebutton]();
		}
	}
}

// Main game loop - called each tick
function onTick() {
	timer_func?.();  // Call current timer handler if set
	check_button_hover();  // Check for button hover state changes
}

// Check which button the mouse is hovering over and update appearance
function check_button_hover(){
	var i,sn;
	var n = -1;  // No button hovered initially
	
	// Check each button for hover
	for( i=0; i<bmax; i++ ){
		sn = sn_btn+i;
		if( !spr[sn].visible ) continue;  // Skip invisible buttons
		
		// Convert mouse coordinates to button's local space
		var pt = spr[sn].globalToLocal(stage.mouseX, stage.mouseY);
		
		// Check if point is within button bounds
		if( spr[sn].hitTest(pt.x,pt.y) ) n = i;
	}
	
	// If hover state hasn't changed, no need to update
	if( activebutton == n ) return;
	
	// Update active button index
	activebutton = n;
	
	// Update appearance of all buttons
	for( var i=0; i<bmax; i++ ){
		if( i==activebutton ){
			// Pressed appearance for hovered button
			spr[sn_btn+i].getChildAt(0).gotoAndStop("press");
		}else{
			// Normal appearance for non-hovered buttons
			spr[sn_btn+i].getChildAt(0).gotoAndStop("btn");
		}
	}
	
	// Refresh display
	stage.update();
}

////////////////////////////////////////////////////
// Loading
////////////////////////////////////////////////////

function fake_loading(){
	spr[sn_load].visible = true;
	spr[sn_load].text = " ";
	spr[sn_mes].visible = true;
	spr[sn_mes].text = "Now loading... ";
	spr[sn_mes].x = view_w/2;
	spr[sn_mes].y = view_h/2;
	stage.update();
	waitcount--;
	if( waitcount<=0 ){
		timer_func = null;
		start_title();
	}
}

////////////////////////////////////////////////////
// Title screen
////////////////////////////////////////////////////

function start_title(){
	var i;
	
	for( i=0; i<sn_max; i++ ) spr[i].visible = false;

	// Initialize game speed variables and update spectator mode from config
	var gameSpeedMultiplier = 1;
	
	if (GAME_CONFIG?.humanPlayerIndex === null) {
		spectate_mode = true;
		
		// Apply speed multiplier if configured
		gameSpeedMultiplier = GAME_CONFIG.spectatorSpeedMultiplier ?? 1;
	} else {
		spectate_mode = false;
	}
	
	spr[sn_title].visible = true;
	spr[sn_title].x = 0;
	spr[sn_title].y = 0;
	spr[sn_title].gotoAndStop("title");

	spr[sn_mes].visible = true;
	spr[sn_mes].text = "Copyright (C) 2001 GAMEDESIGN";
	spr[sn_mes].color = "#aaaaaa";
	spr[sn_mes].textAlign = "right";
	spr[sn_mes].x = view_w*0.9;
	spr[sn_mes].y = view_h*0.24;
	
	spr[sn_pmax].visible = true;
	for( i=0; i<7; i++ ){
		spr[sn_pmax].getChildByName("p"+i).color = (i==game.pmax-2)?"#aa0000":"#cccccc";
	}
	
	// Button
	spr[sn_btn+0].x = resize(640);
	spr[sn_btn+0].y = resize(390);
	spr[sn_btn+0].visible = true;
	btn_func[0] = start_normal_game; // Call our new function for normal game mode
	spr[sn_btn+1].x = resize(640);
	spr[sn_btn+1].y = resize(490);
	spr[sn_btn+1].visible = true;
	btn_func[1] = toppage;

	stage.update();

	timer_func = null;
	click_func = click_pmax;
	move_func = null;
	releaese_func = null;	
}

function click_pmax(){
	var i,pmax=-1;
	for( i=0; i<7; i++ ){
		var o = spr[sn_pmax].getChildByName("p"+i);
		var pt = o.globalToLocal(stage.mouseX, stage.mouseY);
		if( Math.abs(pt.x)<(70*nume/deno) && Math.abs(pt.y)<(20*nume/deno) ){
			pmax = i+2;
		}
	}
	if( pmax<0 ) return;
	game.pmax = pmax;
	for( i=0; i<7; i++ ){
		spr[sn_pmax].getChildByName("p"+i).color = (i==game.pmax-2)?"#aa0000":"#cccccc";
	}
	stage.update();
}

// Start a normal (human player) game
function start_normal_game() {
	// Ensure we're in normal mode, not spectator mode
	spectate_mode = false;
	
	// Update GAME_CONFIG for normal mode (human is player 0)
	if (typeof GAME_CONFIG !== 'undefined') {
		GAME_CONFIG.humanPlayerIndex = 0; // Set human player to index 0
	}
	
	// Create a new map
	make_map();
}

////////////////////////////////////////////////////
// Map creation screen
////////////////////////////////////////////////////

function make_map(){
	var i,j,x,y,n;
	
	for( i=0; i<sn_max; i++ ) spr[i].visible = false;

	game.make_map();
	
	// Dice display order
	for( i=0; i<game.AREA_MAX; i++ ){
		n = prio[i].an;
		prio[i].cpos = game.adat[n].cpos;
	}
	for( i=0; i<game.AREA_MAX-1; i++ ){
		for( j=i; j<game.AREA_MAX; j++ ){
			if( prio[i].cpos>prio[j].cpos ){
				var tmp=prio[i].an; prio[i].an=prio[j].an; prio[j].an=tmp;
				tmp=prio[i].cpos; prio[i].cpos=prio[j].cpos; prio[j].cpos=tmp;
			}
		}
	}
	for( i=0; i<game.AREA_MAX; i++ ){
		n = prio[i].an;
		an2sn[n] = sn_dice+i;
	}

	// Area fill
	for( i=0; i<game.AREA_MAX; i++ ){
		draw_areashape(sn_area+i,i,0);
	}
	
	// Area dice
	for( i=0; i<game.AREA_MAX; i++ ){
		draw_areadice(sn_dice+i,prio[i].an);
	}

	spr[sn_mes].visible = true;
	spr[sn_mes].text = "Play this board?";
	spr[sn_mes].color = "#000000";
	spr[sn_mes].textAlign = "left";
	spr[sn_mes].x = view_w*0.1;
	spr[sn_mes].y = ypos_mes;

	// Button
	spr[sn_btn+2].x = resize(500);
	spr[sn_btn+2].y = ypos_mes;
	spr[sn_btn+2].visible = true;
	btn_func[2] = start_game;
	spr[sn_btn+3].x = resize(650);
	spr[sn_btn+3].y = ypos_mes;
	spr[sn_btn+3].visible = true;
	btn_func[3] = make_map;
	
	stage.update();	
	
	timer_func = null;
	click_func = null;
	move_func = null;
	releaese_func = null;	
}


function draw_areashape( sn, area, paint_mode ){
	var i,j;

	if( game.adat[area].size==0 ){
		spr[sn].visible = false;
		return;
	}
	spr[sn].visible = true;
	spr[sn].graphics.clear();
	var cnt = 0;
	var c = game.adat[area].line_cel[cnt];
	var d = game.adat[area].line_dir[cnt];
	var ax = [cel_w/2,cel_w,cel_w,cel_w/2,0,0,cel_w/2];
	var ax_left = [cel_w/2,cel_w,cel_w,cel_w/2,-cel_w/2,-cel_w/2,cel_w/2];
	var s = 3*nume/deno;
	var ay = [-s,s,cel_h-s,cel_h+s,cel_h-s,s,-s];
	var ay_top = [-cel_h/2,-cel_h/2,cel_h-s,cel_h+s,cel_h-s,-cel_h/2,-cel_h/2];
	var line_color = "#222244";
	if( paint_mode ) line_color = "#ff0000";
	spr[sn].graphics.beginStroke(line_color);
	var armcolor = ["#b37ffe","#b3ff01","#009302","#ff7ffe","#ff7f01","#b3fffe","#ffff01","#ff5858"];
	var color = armcolor[game.adat[area].arm];
	if( paint_mode ) color = "#000000";
	spr[sn].graphics.setStrokeStyle(4*nume/deno,"round","round").beginFill(color);
	var px=ax[d];
	var py=ay[d];
	spr[sn].graphics.moveTo( cpos_x[c]+px, cpos_y[c]+py );
	for( var i=0; i<100; i++ ){
		// Draw the line first
		var px=ax[d+1];
		var py=ay[d+1];
		spr[sn].graphics.lineTo(cpos_x[c]+px,cpos_y[c]+py);
		cnt++;
		c = game.adat[area].line_cel[cnt];
		d = game.adat[area].line_dir[cnt];
		if( c==game.adat[area].line_cel[0] && d==game.adat[area].line_dir[0] ) break;
	}
}

// Area dice
function draw_areadice(sn,area){
	if( game.adat[area].size==0 ){
		spr[sn].visible = false;
		return;
	}
	spr[sn].visible = true;
	var n = game.adat[area].cpos;
	spr[sn].x = Math.floor(cpos_x[n] + 6*nume/deno);
	spr[sn].y = Math.floor(cpos_y[n] - 10*nume/deno);
	spr[sn].gotoAndStop(game.adat[area].arm*10+game.adat[area].dice-1);
}

////////////////////////////////////////////////////
// Start play
////////////////////////////////////////////////////

async function start_game(){
	// Apply any GAME_CONFIG settings before starting the game
	if (typeof GAME_CONFIG !== 'undefined') {
		if (GAME_CONFIG.humanPlayerIndex === null) {
			// Setting for AI vs AI mode
			game.user = null;
			spectate_mode = true;
			
			// Apply speed multiplier if configured
			if (typeof GAME_CONFIG.spectatorSpeedMultiplier === 'number') {
				window.gameSpeedMultiplier = GAME_CONFIG.spectatorSpeedMultiplier;
			}
		} else {
			// Normal mode with human player
			game.user = GAME_CONFIG.humanPlayerIndex || 0;
			spectate_mode = false;
		}
	} else {
		// If no GAME_CONFIG exists, ensure we're in normal mode
		game.user = 0;
		spectate_mode = false;
	}
	
	// Apply ES6 configuration if available
	if (window.pendingGameConfig && typeof applyGameConfig === 'function') {
		try {
			await applyGameConfig(game);
		} catch (error) {
			console.error('Failed to apply game configuration:', error);
		}
	}
	
	game.start_game();
	start_player();
}

// Player state
function draw_player_data(){
	var i;
	var pnum = 0;
	
	// First count active players
	for( i=0; i<8; i++ ){
		spr[sn_player+i].visible = false;
		var p = game.jun[i];
		if( game.player[p].area_tc > 0 ){
			spr[sn_player+i].visible = true;
			pnum++;
		}
	}
	
	// Then position and update their displays
	var c=0;
	for( i=0; i<8; i++ ){
		var p = game.jun[i];
		if( game.player[p].area_tc == 0 )continue;
		var sn = sn_player+i;
		var w = 100*nume/deno; // Explicitly declare with var to avoid global leakage
		var ox = view_w/2-(pnum-1)*w/2+c*w;
		spr[sn].x = ox;
		spr[sn].y = ypos_arm;
		spr[sn].getChildAt(0).gotoAndStop("d"+p+"0");
		spr[sn].getChildAt(1).text = ""+game.player[p].area_tc;
		spr[sn].getChildAt(2).text = "";
		if( game.player[p].stock>0 ) spr[sn].getChildAt(2).text = ""+game.player[p].stock;
		
		// Show current player marker
		if( i==game.ban ){
			spr[sn_ban].x = ox;
			spr[sn_ban].y = ypos_arm;
			spr[sn_ban].gotoAndStop("ban");
			spr[sn_ban].visible = true;
		}
		c++;
	}
	
	// Make sure title button stays visible and properly positioned in spectator mode
	if (spectate_mode) {
		// Position the TITLE button in the top-left corner (but fully visible)
		spr[sn_btn+5].x = resize(60);
		spr[sn_btn+5].y = resize(25);
		spr[sn_btn+5].visible = true;
		// Make sure the button function is properly set
		btn_func[5] = start_title;
	}
}

////////////////////////////////////////////////////
// Turn started
////////////////////////////////////////////////////

function start_player(){
	
	for( var i=sn_info; i<sn_max; i++ ){
		spr[i].visible = false;
	}
	
	// Make sure all buttons are hidden initially
	for( var i=0; i<bmax; i++ ){
		spr[sn_btn+i].visible = false;
	}

	if ( !spectate_mode ) {
		draw_player_data();
	} else {
		// In spectator mode, show both the title button and player info
		spr[sn_btn+5].visible = true;
		draw_player_data();
	}
	
	if( game.jun[game.ban] == game.user && !spectate_mode ){
		start_man();
	} else {
		start_com();
	}
}

////////////////////////////////////////////////////
// Start player action
////////////////////////////////////////////////////

function start_man(){
	
	spr[sn_mes].visible = true;
	spr[sn_mes].text = "1. Click your area. 2. Click neighbor to attack.";
	spr[sn_mes].color = "#000000";
	spr[sn_mes].textAlign = "left";
	spr[sn_mes].x = view_w*0.05;
	spr[sn_mes].y = ypos_mes;
	
	// Button
	activebutton = -1;	// Bug fix for endturn triggering without button click
	spr[sn_btn+4].x = view_w-100*nume/deno;
	spr[sn_btn+4].y = ypos_mes;
	spr[sn_btn+4].visible = true;
	btn_func[4] = end_turn;
	
	spr[sn_from].visible = false;
	spr[sn_to].visible = false;
	stage.update();
	
	timer_func = null;
	click_func = first_click;
	move_func = null;
	releaese_func = null;	
}

// Get clicked area
function clicked_area(){
	var i,sn;
	var ret = -1;
	for( i=0; i<game.AREA_MAX; i++ ){
		if( game.adat[i].size==0 ) continue;
		sn = sn_area+i;
		var pt = spr[sn].globalToLocal(stage.mouseX, stage.mouseY);
		if( spr[sn].hitTest(pt.x,pt.y) ) ret=i;
	}
	for( i=0; i<game.AREA_MAX; i++ ){
		var a = prio[i].an;
		if( game.adat[a].size==0 ) continue;
		sn = sn_dice+i;
		var pt = spr[sn].globalToLocal(stage.mouseX, stage.mouseY);
		if( spr[sn].hitTest(pt.x,pt.y) ) ret=a;
	}
	return ret;
}

// First click
function first_click(){
	var p = game.jun[game.ban];
	var an = clicked_area();
	if( an<0 ) return;
	if( game.adat[an].arm != p ) return;
	if( game.adat[an].dice<=1 ) return;

	spr[sn_mes].visible = false;
		
	game.area_from = an;
	draw_areashape(sn_from,an,1);

	playSound("snd_click");

	stage.update();
	click_func = second_click;
}

// Second click
function second_click(){
	var p = game.jun[game.ban];
	var an = clicked_area();
	if( an<0 ) return;
	
	// Deselect if same area is clicked	
	if( an==game.area_from ){
		start_man();
		return;
	}
	if( game.adat[an].arm == p ) return;
	if( game.adat[an].join[game.area_from]==0 ) return;
	
	game.area_to = an;
	draw_areashape(sn_to,an,1);
	stage.update();
	playSound("snd_click");
	start_battle();
}

// End action
function end_turn(){

	spr[sn_btn+4].visible = false;
	spr[sn_from].visible = false;
	spr[sn_to].visible = false;
	spr[sn_mes].visible = false;
	
	timer_func = null;
	click_func = null;
	move_func = null;
	releaese_func = null;

	start_supply();
}

////////////////////////////////////////////////////
// COM thinking
////////////////////////////////////////////////////

function start_com(){
	// Hide all buttons first
	for( var i=0; i<bmax; i++ ){
		spr[sn_btn+i].visible = false;
	}
	
	// Make sure title button stays visible and properly positioned in spectator mode
	if (spectate_mode) {
		// Ensure TITLE button is properly positioned in the center bottom
		spr[sn_btn+5].x = view_w/2;
		spr[sn_btn+5].y = view_h*0.88;
		spr[sn_btn+5].visible = true;
		
		// Show player data in spectator mode
		draw_player_data();
	}
	
	var ret = game.com_thinking();
	if( ret==0 ){
		start_supply();
		return;
	}
	stage.update();
	
	// Reduce wait time in spectator mode
	var speedMultiplier = spectate_mode ? (window.gameSpeedMultiplier ?? 1) : 1;
	waitcount = Math.max(1, Math.floor(5/speedMultiplier));
	timer_func = com_from;
	click_func = null;
	move_func = null;
	releaese_func = null;
}

function com_from(){
	// Apply speed multiplier in spectator mode
	var speedMultiplier = spectate_mode ? (window.gameSpeedMultiplier ?? 1) : 1;
	waitcount -= speedMultiplier;
	
	if( waitcount>0 ) return;
	
	draw_areashape(sn_from,game.area_from,1);
	
	// Make sure title button stays visible and properly positioned in spectator mode
	if (spectate_mode) {
		// Position the TITLE button in the top-left corner (but fully visible)
		spr[sn_btn+5].x = resize(60);
		spr[sn_btn+5].y = resize(25);
		spr[sn_btn+5].visible = true;
		// Make sure the button function is properly set
		btn_func[5] = start_title;
	}
	
	stage.update();
	
	// Reduce wait time in spectator mode
	waitcount = Math.max(1, Math.floor(5/speedMultiplier));
	timer_func = com_to;
}

function com_to(){
	// Apply speed multiplier in spectator mode
	var speedMultiplier = (spectate_mode && window.gameSpeedMultiplier) ? window.gameSpeedMultiplier : 1;
	waitcount -= speedMultiplier;
	
	if( waitcount>0 ) return;

	draw_areashape(sn_to,game.area_to,1);
	
	// Make sure title button stays visible and properly positioned in spectator mode
	if (spectate_mode) {
		// Position the TITLE button in the top-left corner (but fully visible)
		spr[sn_btn+5].x = resize(60);
		spr[sn_btn+5].y = resize(25);
		spr[sn_btn+5].visible = true;
		// Make sure the button function is properly set
		btn_func[5] = start_title;
	}
	
	stage.update();

	start_battle();
}


////////////////////////////////////////////////////
// Battle
////////////////////////////////////////////////////

function start_battle(){
	var i,j;
	
	spr[sn_btn+4].visible = false;	// Hide END TURN button
	spr[sn_ban].visible = false;
	for( i=0; i<8; i++ ){
		spr[sn_player+i].visible = false;
	}
	
	// Make sure title button stays visible in spectator mode
	if (spectate_mode) {
		spr[sn_btn+5].visible = true;
		
		// Reduce battle animation length in spectator mode
		var speedMultiplier = (window.gameSpeedMultiplier) ? window.gameSpeedMultiplier : 1;
		waitcount = Math.max(1, Math.floor(15/speedMultiplier));
	}

	// Battle scene variables	
	var an = [game.area_from,game.area_to];
	for( i=0; i<2; i++ ){
		battle[i].arm = game.adat[an[i]].arm;
		battle[i].dmax = game.adat[an[i]].dice;
		for( j=0; j<8; j++ ){
			var r = Math.floor(Math.random()*8);
			var tmp = battle[i].usedice[j];
			battle[i].usedice[j] = battle[i].usedice[r];
			battle[i].usedice[r] = tmp;
		}
		battle[i].sum=0;
		for( j=0; j<8; j++ ){
			battle[i].deme[j] = Math.floor(Math.random()*6);
			if( battle[i].usedice[j]<battle[i].dmax ){
				battle[i].sum += 1+battle[i].deme[j];
			}
			battle[i].fin[j] = false;
		}
	}
	spr[sn_battle].visible = true;
	
	for( i=0; i<2; i++ ){
		var w = 4;
		var h = 2;
		var r = 8;
		var ox = (i==0)?w*100:-w*90;
		var oy = (i==0)?-h*50:h*60;
		for( j=0; j<8; j++ ){
			var o = spr[sn_battle].getChildByName("d"+i+j);
			o.vx = ox + (j%3)*10*w - Math.floor(j/3)*10*w + Math.random()*r;
			o.vy = oy + (j%3)*10*h + Math.floor(j/3)*10*h + Math.random()*r;
			o.x = o.vx;
			o.y = o.vy;
			o.z = Math.random()*10;
			o.up = Math.random()*22;
			o.bc = 0;
			o.visible = false;
			var s = spr[sn_battle].getChildByName("s"+i+j);
			s.x = o.vx;
			s.y = o.vy;
			s.gotoAndStop("shadow");
			s.visible = false;
		}
	}
	spr[sn_battle].getChildByName("n0").x = 110;
	spr[sn_battle].getChildByName("n0").y = -10;
	spr[sn_battle].getChildByName("n0").visible = false;
	spr[sn_battle].getChildByName("n1").x = -290;
	spr[sn_battle].getChildByName("n1").y = -10;
	spr[sn_battle].getChildByName("n1").visible = false;
	
	bturn = 0;

	stage.update();
	timer_func = battle_dice;
	click_func = null;
	move_func = null;
	releaese_func = null;
}

function battle_dice(){
	var i,j;
	var w = (bturn==0)?-10:10;
	var h = (bturn==0)?6:-6;
	var f=false;
	var soundflg = false;
	
	// Apply speed multiplier in spectator mode
	var speedMultiplier = (spectate_mode && window.gameSpeedMultiplier) ? window.gameSpeedMultiplier : 1;
	
	// Make sure title button stays visible and properly positioned in spectator mode
	if (spectate_mode) {
		// Position the TITLE button in the top-left corner (but fully visible)
		spr[sn_btn+5].x = resize(60);
		spr[sn_btn+5].y = resize(25);
		spr[sn_btn+5].visible = true;
		// Make sure the button function is properly set
		btn_func[5] = start_title;
	}
	
	for( i=0; i<8; i++ ){
		if( battle[bturn].fin[i]>0 ) continue;
		var o = spr[sn_battle].getChildByName("d"+bturn+i);
		o.visible = true;
		o.vx += w;
		o.vy += h;
		o.z += o.up;
		o.up -= 3;
		if( o.z<0 ){
			o.z = 0;
			o.up = 5-o.bc*3;
			o.bc++;
			if( o.bc>=2 ){
				battle[bturn].fin[i] = 1;
				if( bturn==0 ){
					if( i>=3 ){
						if( battle[bturn].fin[i-3]==0 ) battle[bturn].fin[i] = 0;
					}
					if( i>=2 ){
						if( battle[bturn].fin[i-2]==0 ) battle[bturn].fin[i] = 0;
					}
				}else{
					if( i<5 ){
						if( battle[bturn].fin[i+3]==0 ) battle[bturn].fin[i] = 0;
					}
					if( i<6 ){
						if( battle[bturn].fin[i+2]==0 ) battle[bturn].fin[i] = 0;
					}
				}
			}
			if( o.bc==1 ){
				if( battle[bturn].usedice[i]<battle[bturn].dmax ) soundflg = true;
			}
		}
		o.x = o.vx;
		o.y = o.vy-o.z;
		o.gotoAndStop("d"+battle[bturn].arm+Math.floor(Math.random()*6));
		if( battle[bturn].fin[i]>0 ){
			o.gotoAndStop("d"+battle[bturn].arm+battle[bturn].deme[i]);
			if( battle[bturn].usedice[i]<battle[bturn].dmax ) soundflg = true;
		}
		var s = spr[sn_battle].getChildByName("s"+bturn+i);
		s.visible = true;
		s.x = o.vx;
		s.y = o.vy;
		if( battle[bturn].usedice[i]>=battle[bturn].dmax ){
			o.visible = false;
			s.visible = false;
		}
		f=true;
	}
	if( !f ){
		spr[sn_battle].getChildByName("n"+bturn).visible = true;
		spr[sn_battle].getChildByName("n"+bturn).text = ""+battle[bturn].sum;
		bturn++;
		if( bturn>=2 ){
			// Reduce wait time in spectator mode
			var speedMultiplier = (spectate_mode && window.gameSpeedMultiplier) ? window.gameSpeedMultiplier : 1;
			waitcount = Math.max(1, Math.floor(15/speedMultiplier));
			timer_func = after_battle;
		}
	}
	if( soundflg ){
		playSound("snd_dice");
	}
	stage.update();
}

function after_battle(){
	// Apply speed multiplier in spectator mode
	var speedMultiplier = (spectate_mode && window.gameSpeedMultiplier) ? window.gameSpeedMultiplier : 1;
	waitcount -= speedMultiplier;
	
	if( waitcount>0 ) return;
	spr[sn_battle].visible = false;
	spr[sn_from].visible = false;
	spr[sn_to].visible = false;
	
	// Show player indicators and turn marker based on game mode
	if (!spectate_mode) {
		spr[sn_ban].visible = true;
		for( i=0; i<8; i++ ){
			spr[sn_player+i].visible = true;
		}
	} else {
		// In spectator mode, show player data but ensure title button is visible
		draw_player_data();
		spr[sn_btn+5].visible = true;
	}
	
	var arm0 = game.adat[game.area_from].arm;
	var arm1 = game.adat[game.area_to].arm;
	var defeat = ( battle[0].sum>battle[1].sum ) ? 1 : 0;
	if( defeat>0 ){
		game.adat[game.area_to].dice = game.adat[game.area_from].dice-1;
		game.adat[game.area_from].dice = 1;
		game.adat[game.area_to].arm = arm0;
		game.set_area_tc(arm0);
		game.set_area_tc(arm1);
		playSound("snd_success");
	}else{
		game.adat[game.area_from].dice = 1;
		playSound("snd_fail");
	}
	
	draw_areashape(sn_area+game.area_to,game.area_to,0);
	draw_areadice(an2sn[game.area_from],game.area_from);
	draw_areadice(an2sn[game.area_to],game.area_to);
	
	// History
	game.set_his(game.area_from,game.area_to,defeat);

	// Check if human player has lost (only in non-spectator mode)
	if(!spectate_mode && game.user !== null && game.player[game.user].area_tc==0){
		draw_player_data();
		start_gameover();
	}else{
		var c=0;
		for( var i=0; i<game.pmax; i++ ){
			if( game.player[i].area_tc>0 ) c++;
		}
		if( c==1 ){
			if ( !spectate_mode ) {
				draw_player_data();
				start_win();
			}else{
				// an ai has won
				start_gameover()
			}
		}else{
			start_player();
		}
	}
}

////////////////////////////////////////////////////
// Start dice supply
////////////////////////////////////////////////////

function start_supply(){
	spr[sn_from].visible = false;
	spr[sn_to].visible = false;
	spr[sn_btn+4].visible = false;

	// Make sure title button stays visible and properly positioned in spectator mode
	if (spectate_mode) {
		// Ensure TITLE button is properly positioned in the center bottom
		spr[sn_btn+5].x = view_w/2;
		spr[sn_btn+5].y = view_h*0.88;
		spr[sn_btn+5].visible = true;
		
		// Show player data in spectator mode
		draw_player_data();
	}

	var pn = game.jun[game.ban];
//	game.player[pn].stock = 64;
	game.set_area_tc(pn);
	game.player[pn].stock += game.player[pn].area_tc;
	if( game.player[pn].stock > game.STOCK_MAX ){
		game.player[pn].stock = game.STOCK_MAX;
	}
	
	spr[sn_supply].visible = true;
	for( var i=0; i<game.STOCK_MAX; i++ ){
		if( i<game.player[pn].stock ){
			spr[sn_supply].getChildAt(i).visible = true;
			spr[sn_supply].getChildAt(i).gotoAndStop("d"+pn+"3");
		}else{
			spr[sn_supply].getChildAt(i).visible = false;
		}
	}
	stage.update();
	
	// Reduce wait time in spectator mode
	var speedMultiplier = (spectate_mode && window.gameSpeedMultiplier) ? window.gameSpeedMultiplier : 1;
	waitcount = Math.max(1, Math.floor(10/speedMultiplier));
	timer_func = supply_waiting;
	click_func = null;
	move_func = null;
	releaese_func = null;	
}

function supply_waiting(){
	// Apply speed multiplier in spectator mode
	var speedMultiplier = (spectate_mode && window.gameSpeedMultiplier) ? window.gameSpeedMultiplier : 1;
	waitcount -= speedMultiplier;
	
	if( waitcount>0 ) return;
	
	// Make sure title button stays visible and properly positioned in spectator mode
	if (spectate_mode) {
		// Position the TITLE button in the top-left corner (but fully visible)
		spr[sn_btn+5].x = resize(60);
		spr[sn_btn+5].y = resize(25);
		spr[sn_btn+5].visible = true;
		// Make sure the button function is properly set
		btn_func[5] = start_title;
	}
	
	timer_func = supply_dice;
}

function supply_dice(){
	// Make sure title button stays visible and properly positioned in spectator mode
	if (spectate_mode) {
		// Position the TITLE button in the top-left corner (but fully visible)
		spr[sn_btn+5].x = resize(60);
		spr[sn_btn+5].y = resize(25);
		spr[sn_btn+5].visible = true;
		// Make sure the button function is properly set
		btn_func[5] = start_title;
	}
	
	var pn = game.jun[game.ban];
	var list = new Array();
	c = 0;
	for( var i=0; i<game.AREA_MAX; i++ ){
		if( game.adat[i].size == 0 ) continue;
		if( game.adat[i].arm != pn ) continue;
		if( game.adat[i].dice >= 8 ) continue;
		list[c] = i;
		c++;
	}
	if( c==0 || game.player[pn].stock<=0 ){
		next_player();
		return;
	}
	
	game.player[pn].stock--;
	var an = list[Math.floor(Math.random()*c)];
	game.adat[an].dice++;
	draw_areadice(an2sn[an],an);
	
	for( i=0; i<game.STOCK_MAX; i++ ){
		if( i<game.player[pn].stock ){
			spr[sn_supply].getChildAt(i).visible = true;
		}else{
			spr[sn_supply].getChildAt(i).visible = false;
		}
	}
	// History
	game.set_his(an,0,0);

	// Make sure title button stays visible and properly positioned in spectator mode
	if (spectate_mode) {
		// Position the TITLE button in the top-left corner (but fully visible)
		spr[sn_btn+5].x = resize(60);
		spr[sn_btn+5].y = resize(25);
		spr[sn_btn+5].visible = true;
		// Make sure the button function is properly set
		btn_func[5] = start_title;
	}

	stage.update();
	
	return;
}


////////////////////////////////////////////////////
// To next player
////////////////////////////////////////////////////

function next_player(){
	// Make sure title button stays visible and properly positioned in spectator mode
	if (spectate_mode) {
		// Position the TITLE button in the top-left corner (but fully visible)
		spr[sn_btn+5].x = resize(60);
		spr[sn_btn+5].y = resize(25);
		spr[sn_btn+5].visible = true;
		// Make sure the button function is properly set
		btn_func[5] = start_title;
	}
	
	for( var i=0; i<game.pmax; i++ ){
		game.ban++;
		if( game.ban >= game.pmax ) game.ban = 0;
		var pn = game.jun[game.ban];
		if( game.player[pn].area_tc ) break;
	}
	if( game.jun[game.ban] == game.user && !spectate_mode ) playSound("snd_myturn");

	start_player();
}

////////////////////////////////////////////////////
// GAMEOVER
////////////////////////////////////////////////////

function start_gameover(){
	// Clear any existing UI elements
	for( var i=0; i<sn_max; i++ ) {
		if (i !== sn_gameover) {
			spr[i].visible = false;
		}
	}
	
	// Show game over UI
	spr[sn_gameover].visible = false;
	spr[sn_gameover].x = view_w/2;
	spr[sn_gameover].y = view_h/2;
	spr[sn_gameover].getChildByName("bg").alpha = 0;
	spr[sn_gameover].getChildByName("mes").alpha = 0;
	spr[sn_gameover].getChildByName("mes").y = -120;
	stage.update();
	stat = 0;
	waitcount = 0;
	timer_func = gameover;
	click_func = null;
	move_func = null;
	releaese_func = null;	
}

function gameover(){
	
	spr[sn_gameover].visible = true;
	waitcount++;
	if( stat==0 ){
		var a = (-80+waitcount)/100;
		spr[sn_gameover].getChildByName("bg").alpha=a;
		if( a>0.8 ){
			playSound("snd_over");
			waitcount=0;
			stat++;
		}
		stage.update();
	}else if( stat==1 ){
		var a = waitcount/100;
		var o = spr[sn_gameover].getChildByName("mes");
		o.alpha=a;
		o.y+=0.5;
		if( o.y>-70 ) o.y=-70;
		if( waitcount>=160 ){
			// Button
			spr[sn_btn+5].x = view_w/2 - resize(200);
			spr[sn_btn+5].y = view_h/2 + resize(70);
			spr[sn_btn+5].visible = true;
			btn_func[5] = start_title;
			spr[sn_btn+6].x = view_w/2;
			spr[sn_btn+6].y = view_h/2 + resize(70);
			spr[sn_btn+6].visible = true;
			btn_func[6] = start_history;
			if ( !spectate_mode ) {
				spr[sn_btn+7].x = view_w/2 + resize(200);
				spr[sn_btn+7].y = view_h/2 + resize(70);
				spr[sn_btn+7].visible = true;
				btn_func[7] = start_spectate;
			}

			waitcount=0;
			stat++;
		}
		stage.update();
	}
}

////////////////////////////////////////////////////
// YOU WIN!
////////////////////////////////////////////////////

function start_win(){
	spr[sn_win].visible = false;
	spr[sn_win].x = view_w/2;
	spr[sn_win].y = view_h/2 - resize(70);
	spr[sn_win].gotoAndStop("win");
	waitcount = 0;
	timer_func = win;
	click_func = null;
	move_func = null;
	releaese_func = null;	
}

function win(){
	waitcount++;
	var a = Math.floor(waitcount/2);
	if( a==10 || a==12 || a==14 || a==16 || a>=18 ){
		spr[sn_win].visible = true;
	}else{
		spr[sn_win].visible = false;
	}
	if( a==10 ){
		playSound("snd_clear");
	}
	
	if( a>=40 ){
		timer_func = null;
		spr[sn_btn+6].x = view_w/2;
		spr[sn_btn+6].y = view_h/2 + resize(70);
		spr[sn_btn+6].visible = true;
		btn_func[6] = start_history;
	}
	stage.update();
}

////////////////////////////////////////////////////
// History
////////////////////////////////////////////////////

function start_history(){
	var i;
	
	spr[sn_win].visible = false;
	spr[sn_gameover].visible = false;
	spr[sn_ban].visible = false;
	for( i=0; i<8; i++ ) spr[sn_player+i].visible = false;
	for( i=0; i<bmax; i++ ) spr[sn_btn+i].visible = false;

	for( i=0; i<game.AREA_MAX; i++ ){
		if( game.adat[i].size==0 ) continue;
		game.adat[i].dice = game.his_dice[i];
		game.adat[i].arm = game.his_arm[i];
		draw_areashape(sn_area+i,i,0);
	}
	for( i=0; i<game.AREA_MAX; i++ ){
		draw_areadice(sn_dice+i,prio[i].an);
	}
	
	// Button
	spr[sn_btn+5].x = view_w/2 - resize(100);
	spr[sn_btn+5].y = view_h*0.88;
	spr[sn_btn+5].visible = true;
	btn_func[5] = start_title;
	spr[sn_btn+1].x = view_w/2 + resize(100);
	spr[sn_btn+1].y = view_h*0.88;
	spr[sn_btn+1].visible = true;
	btn_func[1] = toppage;
	
	stage.update();
	replay_c = 0;
	stat = 0;
	waitcount = 0;
	timer_func = play_history;
	click_func = null;
	move_func = null;
	releaese_func = null;	
}

function play_history(){

	var an;
	if( stat==0 ){
		if( replay_c >= game.his_c ){
			timer_func = null;	// End
		}else{
			stat = ( game.his[replay_c].to==0 ) ? 1 : 2;
		}
	}else if( stat==1 ){
		// Supply
		an = game.his[replay_c].from;
		game.adat[an].dice++;
		draw_areadice(an2sn[an],an);
		stage.update();
		replay_c++;
		if( replay_c >= game.his_c ){
			timer_func = null;	// End
		}else{
			stat = ( game.his[replay_c].to==0 ) ? 1 : 2;
		}
	}else if( stat==2 ){
		// Attack source
		an = game.his[replay_c].from;
		draw_areashape(sn_from,an,1);
		stage.update();
		waitcount=0;
		stat++;
	}else if( stat==3 ){
		// Attack destination
		if( waitcount>2 ){
			an = game.his[replay_c].to;
			draw_areashape(sn_to,an,1);
			stage.update();
			waitcount=0;
			stat++;
		}
	}else if( stat==4 ){
		// After attack
		if( waitcount>10 ){
			var an0 = game.his[replay_c].from;
			var an1 = game.his[replay_c].to;
			if( game.his[replay_c].res>0 ){
				game.adat[an1].dice = game.adat[an0].dice-1;
				game.adat[an0].dice = 1;
				game.adat[an1].arm = game.adat[an0].arm;
				playSound("snd_success");
			}else{
				game.adat[an0].dice = 1;
				playSound("snd_fail");
			}
			spr[sn_from].visible = false;
			spr[sn_to].visible = false;
			draw_areadice(an2sn[an0],an0);
			draw_areadice(an2sn[an1],an1);
			draw_areashape(sn_area+an1,an1,0);
			stage.update();
			stat=0;
			replay_c++;
		}
	}
	waitcount++;
}

////////////////////////////////////////////////////
// Link
////////////////////////////////////////////////////

function toppage(){
	// Set up AI vs AI mode
	spectate_mode = true;
	
	// Set a default speed multiplier for better experience
	window.gameSpeedMultiplier = 2;
	
	// Create or update GAME_CONFIG for AI vs AI mode
	window.GAME_CONFIG = GAME_CONFIG ?? {};
	
	// Update config properties
	GAME_CONFIG.humanPlayerIndex = null;
	GAME_CONFIG.spectatorSpeedMultiplier = window.gameSpeedMultiplier;
	
	// Ensure all players have AI assignments in spectator mode
	if (!GAME_CONFIG.aiAssignments || GAME_CONFIG.aiAssignments.includes(null)) {
		GAME_CONFIG.aiAssignments = [
			'ai_default',     // Player 0
			'ai_defensive',   // Player 1
			'ai_defensive',   // Player 2
			'ai_adaptive',    // Player 3
			'ai_default',     // Player 4
			'ai_default',     // Player 5
			'ai_default',     // Player 6
			'ai_default'      // Player 7
		];
	}
	
	// Start a new game in spectator mode - use the proper function sequence
	// First generate the map
	make_map();
	
	// Then immediately accept it (auto-click YES)
	// This bypasses the YES/NO prompt completely
	start_game();
}

////////////////////////////////////////////////////
// spectating
////////////////////////////////////////////////////

function start_spectate(){
	var i;
	
	// Hide all UI elements first
	for( i=0; i<sn_max; i++ ) {
		spr[i].visible = false;
	}
	
	// Show only the map elements
	for( i=0; i<game.AREA_MAX; i++ ) {
		if( game.adat[i].size > 0 ) {
			spr[sn_area+i].visible = true;
		}
	}
	
	// Show dice for territories
	for( i=0; i<game.AREA_MAX; i++ ) {
		if( game.adat[i].size > 0 ) {
			spr[an2sn[i]].visible = true;
		}
	}
	
	// Button - position in top-left corner (but fully visible)
	spr[sn_btn+5].x = resize(60);
	spr[sn_btn+5].y = resize(25);
	spr[sn_btn+5].visible = true;
	btn_func[5] = start_title;

	spectate_mode = true;
	
	// Show player data in spectator mode
	draw_player_data();
	
	stage.update();
	stat = 0;
	waitcount = 0;
	timer_func = start_player;
	click_func = null;
	move_func = null;
	releaese_func = null;
}
