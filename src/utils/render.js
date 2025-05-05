/**
 * Rendering Utilities Module
 *
 * Provides utilities for game rendering:
 * - CreateJS sprite creation
 * - Map visualization
 * - UI elements
 * - Animation helpers
 */

import { getConfig } from './config.js';

/**
 * Color definitions for players and UI elements
 */
export const COLORS = {
  PLAYER: [
    '#9966FF', // Purple (Human Player)
    '#88FF00', // Lime
    '#00CC00', // Green
    '#FF66DD', // Pink
    '#FF8800', // Orange
    '#00CCFF', // Cyan
    '#FFFF00', // Yellow
    '#FF0000', // Red
  ],
  TERRITORY: {
    BORDER: '#000000', // Territory border
    HIGHLIGHT_ATTACK: '#FF0000', // Attack source highlight
    HIGHLIGHT_TARGET: '#0000FF', // Attack target highlight
  },
  UI: {
    BACKGROUND: '#FFFFFF', // Background color
    TEXT: '#000000', // Default text color
    BUTTON: '#EEEEEE', // Button background
    BUTTON_HOVER: '#DDDDDD', // Button hover state
    BUTTON_TEXT: '#000000', // Button text
    MESSAGE: '#000000', // Message text
  },
};

/**
 * Scale a number based on current display scale
 * @param {number} n - Number to scale
 * @returns {number} Scaled value
 */
export const scaleValue = n => {
  const cfg = getConfig();
  return n * cfg.displayScale;
};

/**
 * Create a new CreateJS text object with standard formatting
 * @param {string} text - Text content
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} [color='#000000'] - Text color
 * @param {string} [font='20px Arial'] - Font specification
 * @param {string} [align='center'] - Text alignment
 * @returns {createjs.Text} The text object
 */
export const createText = (
  text,
  x,
  y,
  color = '#000000',
  font = '20px Arial',
  align = 'center'
) => {
  const textObj = new createjs.Text(text, font, color);
  textObj.x = scaleValue(x);
  textObj.y = scaleValue(y);
  textObj.textAlign = align;
  textObj.textBaseline = 'middle';
  return textObj;
};

/**
 * Create a new CreateJS shape for a button
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Button width
 * @param {number} height - Button height
 * @param {string} [color=COLORS.UI.BUTTON] - Button color
 * @param {number} [cornerRadius=5] - Corner radius for rounded rectangle
 * @returns {createjs.Shape} The button shape
 */
export const createButtonShape = (
  x,
  y,
  width,
  height,
  color = COLORS.UI.BUTTON,
  cornerRadius = 5
) => {
  const button = new createjs.Shape();
  const scaledX = scaleValue(x);
  const scaledY = scaleValue(y);
  const scaledWidth = scaleValue(width);
  const scaledHeight = scaleValue(height);

  button.graphics.beginFill(color).drawRoundRect(0, 0, scaledWidth, scaledHeight, cornerRadius);

  button.x = scaledX;
  button.y = scaledY;

  return button;
};

/**
 * Create a complete button with text and hover effects
 * @param {string} text - Button text
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Button width
 * @param {number} height - Button height
 * @param {Function} onClick - Click handler function
 * @returns {createjs.Container} Container with button shape and text
 */
export const createButton = (text, x, y, width, height, onClick) => {
  const container = new createjs.Container();
  const buttonShape = createButtonShape(0, 0, width, height);
  const buttonText = createText(text, width / 2, height / 2, COLORS.UI.BUTTON_TEXT);

  container.addChild(buttonShape, buttonText);
  container.x = scaleValue(x);
  container.y = scaleValue(y);

  // Add hover and click effects
  container.cursor = 'pointer';

  container.on('mouseover', () => {
    buttonShape.graphics
      .clear()
      .beginFill(COLORS.UI.BUTTON_HOVER)
      .drawRoundRect(0, 0, scaleValue(width), scaleValue(height), 5);
  });

  container.on('mouseout', () => {
    buttonShape.graphics
      .clear()
      .beginFill(COLORS.UI.BUTTON)
      .drawRoundRect(0, 0, scaleValue(width), scaleValue(height), 5);
  });

  container.on('click', onClick);

  return container;
};

/**
 * Draw a hexagonal grid cell
 * @param {createjs.Graphics} graphics - Graphics object to draw on
 * @param {number} x - Center X position
 * @param {number} y - Center Y position
 * @param {number} radius - Distance from center to corners
 * @param {string} [fillColor=null] - Fill color (null for no fill)
 * @param {string} [strokeColor='#000000'] - Stroke color
 * @param {number} [strokeWidth=1] - Stroke width
 */
export const drawHexCell = (
  graphics,
  x,
  y,
  radius,
  fillColor = null,
  strokeColor = '#000000',
  strokeWidth = 1
) => {
  const sides = 6;
  const angle = Math.PI / 3; // 60 degrees in radians

  // Start drawing path
  graphics.setStrokeStyle(strokeWidth);
  if (fillColor) graphics.beginFill(fillColor);
  graphics.beginStroke(strokeColor);

  // Move to first point
  const startX = x + radius * Math.cos(0);
  const startY = y + radius * Math.sin(0);
  graphics.moveTo(startX, startY);

  // Draw the hexagon
  for (let i = 1; i <= sides; i++) {
    const pointX = x + radius * Math.cos(i * angle);
    const pointY = y + radius * Math.sin(i * angle);
    graphics.lineTo(pointX, pointY);
  }

  // Close the path
  graphics.closePath();

  if (fillColor) graphics.endFill();
  graphics.endStroke();
};

/**
 * Draw a territory on the map
 * @param {Game} game - Game instance
 * @param {createjs.Graphics} graphics - Graphics object to draw on
 * @param {number} areaId - Territory ID to draw
 * @param {Object} cellPositions - Object with cellPosX and cellPosY arrays
 * @param {number} cellWidth - Width of a cell
 * @param {number} cellHeight - Height of a cell
 */
export const drawTerritory = (game, graphics, areaId, cellPositions, cellWidth, cellHeight) => {
  const area = game.adat[areaId];
  if (area.size === 0) return; // Skip empty areas

  const playerColor = COLORS.PLAYER[area.arm];
  graphics.beginFill(playerColor);
  graphics.setStrokeStyle(1);
  graphics.beginStroke(COLORS.TERRITORY.BORDER);

  // Draw border cells
  for (let i = 0; i < area.line_cel.length; i++) {
    if (area.line_cel[i] === 0) break;

    const cellIdx = area.line_cel[i];
    const dir = area.line_dir[i];

    const x = cellPositions.cellPosX[cellIdx];
    const y = cellPositions.cellPosY[cellIdx];

    // Draw border segment based on direction
    drawHexCellBorder(graphics, x, y, cellWidth, cellHeight, dir);
  }

  graphics.endFill();
  graphics.endStroke();
};

/**
 * Draw a border segment for a hexagonal cell
 * @param {createjs.Graphics} graphics - Graphics object to draw on
 * @param {number} x - Cell X position
 * @param {number} y - Cell Y position
 * @param {number} cellWidth - Width of cell
 * @param {number} cellHeight - Height of cell
 * @param {number} dir - Direction of the border segment (0-5)
 */
const drawHexCellBorder = (graphics, x, y, cellWidth, cellHeight, dir) => {
  /*
   * This is a placeholder implementation
   * The actual implementation would depend on the specific hex grid visualization
   */

  const radius = Math.min(cellWidth, cellHeight) / 2;
  const angle = Math.PI / 3; // 60 degrees in radians

  // Calculate start point
  const startAngle = dir * angle;
  const startX = x + radius * Math.cos(startAngle);
  const startY = y + radius * Math.sin(startAngle);

  // Calculate end point
  const endAngle = ((dir + 1) % 6) * angle;
  const endX = x + radius * Math.cos(endAngle);
  const endY = y + radius * Math.sin(endAngle);

  // Draw line
  graphics.moveTo(startX, startY);
  graphics.lineTo(endX, endY);
};

/**
 * Create a dice display for a territory
 * @param {number} diceCount - Number of dice
 * @param {number} playerIndex - Player index for color
 * @param {createjs.SpriteSheet} diceSheet - Sprite sheet for dice
 * @returns {createjs.Container} Container with dice display
 */
export const createDiceDisplay = (diceCount, playerIndex, diceSheet) => {
  const container = new createjs.Container();

  // Create sprite for the appropriate dice count and player color
  const diceSprite = new createjs.Sprite(diceSheet);
  const spriteFrame = `p${playerIndex}_d${diceCount}`;
  diceSprite.gotoAndStop(spriteFrame);

  container.addChild(diceSprite);
  return container;
};

/**
 * Create a dice spritesheet with all combinations of players and dice counts
 * @param {number} playerCount - Number of players
 * @param {number} maxDice - Maximum dice count
 * @returns {Promise<createjs.SpriteSheet>} Promise resolving to the sprite sheet
 */
export const createDiceSpriteSheet = (playerCount, maxDice) =>
  new Promise(resolve => {
    const builder = new createjs.SpriteSheetBuilder();

    // For each player and dice count, create a dice display
    for (let player = 0; player < playerCount; player++) {
      for (let dice = 1; dice <= maxDice; dice++) {
        // Create a temporary container to build the dice sprite
        const container = new createjs.Container();

        // Add dice pips based on count in a dice-like pattern
        drawDicePips(container, dice, COLORS.PLAYER[player]);

        // Add the frame to the spritesheet
        builder.addFrame(container, null, 1, null, `p${player}_d${dice}`);
      }
    }

    // Build the spritesheet
    const spriteSheet = builder.build();
    resolve(spriteSheet);
  });

/**
 * Draw dice pips in a container
 * @param {createjs.Container} container - Container to draw in
 * @param {number} count - Number of pips to draw
 * @param {string} color - Color of the pips
 */
const drawDicePips = (container, count, color) => {
  const positions = [
    [0, 0], // Center (for odd numbers)
    [-10, -10], // Top left
    [10, 10], // Bottom right
    [10, -10], // Top right
    [-10, 10], // Bottom left
    [-10, 0], // Middle left
    [10, 0], // Middle right
    [0, -10], // Middle top
    [0, 10], // Middle bottom
  ];

  // Add pips based on dice patterns
  for (let i = 0; i < count && i < positions.length; i++) {
    const [x, y] = positions[i];

    const pip = new createjs.Shape();
    pip.graphics.beginFill(color).drawCircle(x, y, 4);

    container.addChild(pip);
  }
};

/**
 * Create a player status display
 * @param {Game} game - Game instance
 * @param {number} playerIndex - Player index
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {createjs.Container} Container with player status
 */
export const createPlayerStatus = (game, playerIndex, x, y) => {
  const container = new createjs.Container();
  const player = game.player[playerIndex];
  const color = COLORS.PLAYER[playerIndex];

  // Create background
  const bg = new createjs.Shape();
  bg.graphics.beginFill(color).drawRoundRect(0, 0, 100, 30, 5);

  // Create text with template literals
  const areasText = createText(`${player.area_c}`, 25, 15, '#FFFFFF', '16px Arial', 'center');
  const diceText = createText(`${player.dice_c}`, 75, 15, '#FFFFFF', '16px Arial', 'center');

  container.addChild(bg, areasText, diceText);
  container.x = scaleValue(x);
  container.y = scaleValue(y);

  return container;
};

/**
 * Update player status display
 * @param {Game} game - Game instance
 * @param {Object} sprites - Sprite objects
 * @param {number} playerStatusIndex - Starting index for player status sprites
 */
export const updatePlayerStatus = (game, sprites, playerStatusIndex) => {
  // Use Array.from to create a range to iterate over
  Array.from({ length: game.pmax }, (_, i) => {
    const player = game.player[i];
    const statusSprite = sprites[playerStatusIndex + i];

    // Update text children using optional chaining for safety
    if (statusSprite?.children?.length >= 3) {
      const areasText = statusSprite.children[1];
      const diceText = statusSprite.children[2];

      areasText.text = `${player.area_c}`;
      diceText.text = `${player.dice_c}`;
    }
  });
};

/**
 * Render the game map
 * @param {Game} game - Game instance
 * @param {createjs.Stage} stage - CreateJS stage object
 * @param {Array} sprites - Sprite array to store the created sprites
 * @param {Object} spriteIndices - Sprite index references 
 * @param {Array} cellPosX - X-coordinates of cells
 * @param {Array} cellPosY - Y-coordinates of cells 
 * @param {number} cellWidth - Width of cell
 * @param {number} cellHeight - Height of cell
 */
export function renderMap(game, stage, sprites, spriteIndices, cellPosX, cellPosY, cellWidth, cellHeight) {
  // Create territories
  for (let i = 0; i < game.AREA_MAX; i++) {
    const areaShape = new createjs.Shape();
    const areaIndex = spriteIndices.AREA + i;
    
    // Position the map in the center of the screen
    areaShape.x = stage.canvas.width / 2 - game.XMAX * cellWidth / 2 - cellWidth / 4;
    areaShape.y = 50 * (stage.canvas.width / 840); // Scale top margin based on canvas width
    
    stage.addChild(areaShape);
    sprites[areaIndex] = areaShape;
    
    if (game.adat[i].size > 0) {
      drawAreaShape(
        areaShape.graphics, 
        game, 
        i, 
        cellPosX, 
        cellPosY, 
        cellWidth, 
        cellHeight, 
        false
      );
    }
  }
  
  // Set indices for highlight shapes
  spriteIndices.FROM = spriteIndices.AREA + game.AREA_MAX;
  spriteIndices.TO = spriteIndices.AREA + game.AREA_MAX + 1;
  
  // Create highlight shapes
  const fromHighlight = new createjs.Shape();
  const toHighlight = new createjs.Shape();
  
  fromHighlight.x = stage.canvas.width / 2 - game.XMAX * cellWidth / 2 - cellWidth / 4;
  fromHighlight.y = 50 * (stage.canvas.width / 840);
  
  toHighlight.x = stage.canvas.width / 2 - game.XMAX * cellWidth / 2 - cellWidth / 4;
  toHighlight.y = 50 * (stage.canvas.width / 840);
  
  stage.addChild(fromHighlight);
  stage.addChild(toHighlight);
  
  sprites[spriteIndices.FROM] = fromHighlight;
  sprites[spriteIndices.TO] = toHighlight;
  
  fromHighlight.visible = false;
  toHighlight.visible = false;
}

/**
 * Draw a territory shape
 * @param {createjs.Graphics} graphics - Graphics context to draw on
 * @param {Game} game - Game instance
 * @param {number} areaId - Area ID to draw
 * @param {Array} cellPosX - X-coordinates of cells
 * @param {Array} cellPosY - Y-coordinates of cells
 * @param {number} cellWidth - Width of cell
 * @param {number} cellHeight - Height of cell
 * @param {boolean} highlight - Whether to draw as a highlight
 */
function drawAreaShape(graphics, game, areaId, cellPosX, cellPosY, cellWidth, cellHeight, highlight) {
  const area = game.adat[areaId];
  
  if (area.size === 0) {
    return;
  }
  
  // Clear any previous graphics
  graphics.clear();
  
  // Set style for border
  const lineColor = highlight ? COLORS.TERRITORY.HIGHLIGHT_ATTACK : "#222244";
  graphics.setStrokeStyle(4, "round", "round");
  graphics.beginStroke(lineColor);
  
  // Set fill color based on owner or highlight
  const color = highlight ? "#000000" : COLORS.PLAYER[area.arm];
  graphics.beginFill(color);
  
  // Get first cell and direction
  let count = 0;
  let cellIndex = area.line_cel[count];
  let direction = area.line_dir[count];
  
  // Helper arrays for hexagon vertices
  const ax = [cellWidth/2, cellWidth, cellWidth, cellWidth/2, 0, 0, cellWidth/2];
  const ay = [-3, 3, cellHeight-3, cellHeight+3, cellHeight-3, 3, -3];
  
  // Start drawing at first point
  const startX = cellPosX[cellIndex] + ax[direction];
  const startY = cellPosY[cellIndex] + ay[direction];
  graphics.moveTo(startX, startY);
  
  // Draw territory border
  for (let i = 0; i < 100; i++) { // 100 is a safety limit
    // Move to next point
    const nextX = cellPosX[cellIndex] + ax[direction + 1];
    const nextY = cellPosY[cellIndex] + ay[direction + 1];
    graphics.lineTo(nextX, nextY);
    
    // Move to next segment
    count++;
    cellIndex = area.line_cel[count];
    direction = area.line_dir[count];
    
    // Check if we've completed the shape
    if (cellIndex === area.line_cel[0] && direction === area.line_dir[0]) {
      break;
    }
  }
  
  // Close the shape
  graphics.closePath();
  graphics.endFill();
  graphics.endStroke();
}

/**
 * Render dice for territories
 * @param {Game} game - Game instance
 * @param {createjs.Stage} stage - CreateJS stage
 * @param {Array} sprites - Sprite array
 * @param {Object} spriteIndices - Sprite index references
 * @param {Array} cellPosX - X-coordinates of cells
 * @param {Array} cellPosY - Y-coordinates of cells
 * @param {createjs.SpriteSheet} diceSheet - Spritesheet for dice
 */
export function renderDice(game, stage, sprites, spriteIndices, cellPosX, cellPosY, diceSheet) {
  // Start index for dice sprites
  spriteIndices.DICE = spriteIndices.TO + 1;
  
  // Create area draw priority array for z-ordering
  const areaPriority = [];
  for (let i = 0; i < game.AREA_MAX; i++) {
    areaPriority[i] = {
      areaIndex: i, 
      centerPos: game.adat[i].cpos
    };
  }
  
  // Sort by center position to determine draw order
  areaPriority.sort((a, b) => a.centerPos - b.centerPos);
  
  // Area number to sprite index mapping
  const areaToSpriteIndex = [];
  
  // Create dice sprites in draw order
  for (let i = 0; i < game.AREA_MAX; i++) {
    const areaIndex = areaPriority[i].areaIndex;
    const spriteIndex = spriteIndices.DICE + i;
    
    // Create sprite from spritesheet
    const diceSprite = new createjs.Sprite(diceSheet);
    stage.addChild(diceSprite);
    sprites[spriteIndex] = diceSprite;
    
    // Store mapping
    areaToSpriteIndex[areaIndex] = spriteIndex;
    
    // Set initial position and appearance
    if (game.adat[areaIndex].size > 0) {
      const centerPos = game.adat[areaIndex].cpos;
      diceSprite.x = cellPosX[centerPos] + 6;
      diceSprite.y = cellPosY[centerPos] - 10;
      diceSprite.gotoAndStop(game.adat[areaIndex].arm * 10 + game.adat[areaIndex].dice - 1);
    } else {
      diceSprite.visible = false;
    }
  }
  
  // Store the mapping for future updates
  return areaToSpriteIndex;
}

/**
 * Create and render UI elements 
 * @param {Game} game - Game instance
 * @param {createjs.Stage} stage - CreateJS stage
 * @param {Array} sprites - Sprite array
 * @param {Object} spriteIndices - Sprite index references
 * @param {number} viewWidth - View width
 * @param {number} viewHeight - View height
 * @param {number} yPosMessage - Y position for messages
 * @param {number} yPosArmyStatus - Y position for player status
 */
export function renderUI(game, stage, sprites, spriteIndices, viewWidth, viewHeight, yPosMessage, yPosArmyStatus) {
  // Set index where UI elements start
  spriteIndices.INFO = spriteIndices.DICE + game.AREA_MAX;
  
  // Create current player indicator
  spriteIndices.BAN = spriteIndices.INFO;
  sprites[spriteIndices.BAN] = new createjs.MovieClip();
  stage.addChild(sprites[spriteIndices.BAN]);
  
  // Player status displays
  spriteIndices.PLAYER = spriteIndices.BAN + 1;
  for (let i = 0; i < 8; i++) {
    const container = new createjs.Container();
    
    // Player dice icon
    const playerDice = new createjs.MovieClip();
    playerDice.scaleX = playerDice.scaleY = 0.12;
    playerDice.x = -22;
    playerDice.y = 0;
    container.addChild(playerDice);
    
    // Territory count text
    const territoryCount = new createjs.Text("", "32px Anton", "Black");
    territoryCount.textBaseline = "middle";
    territoryCount.x = 5;
    container.addChild(territoryCount);
    
    // Reinforcement count text
    const reinforcementCount = new createjs.Text("", "16px Anton", "Black");
    reinforcementCount.textBaseline = "middle";
    reinforcementCount.x = 5;
    reinforcementCount.y = 28;
    container.addChild(reinforcementCount);
    
    stage.addChild(container);
    sprites[spriteIndices.PLAYER + i] = container;
  }
  
  // Battle animation container
  spriteIndices.BATTLE = spriteIndices.PLAYER + 8;
  sprites[spriteIndices.BATTLE] = new createjs.Container();
  sprites[spriteIndices.BATTLE].y = yPosMessage;
  sprites[spriteIndices.BATTLE].x = viewWidth/2;
  
  // Game over screen
  spriteIndices.GAMEOVER = spriteIndices.BATTLE + 1;
  sprites[spriteIndices.GAMEOVER] = new createjs.Container();
  sprites[spriteIndices.GAMEOVER].x = viewWidth/2;
  sprites[spriteIndices.GAMEOVER].y = viewHeight/2;
  
  // Victory screen
  spriteIndices.WIN = spriteIndices.GAMEOVER + 1;
  sprites[spriteIndices.WIN] = new createjs.MovieClip();
  
  // Title screen
  spriteIndices.TITLE = spriteIndices.WIN + 1;
  sprites[spriteIndices.TITLE] = new createjs.MovieClip();
  
  // Player count selection
  spriteIndices.PMAX = spriteIndices.TITLE + 1;
  sprites[spriteIndices.PMAX] = new createjs.Container();
  
  // Loading indicator
  spriteIndices.LOAD = spriteIndices.PMAX + 1;
  sprites[spriteIndices.LOAD] = new createjs.Text("Now loading...", Math.floor(24) + "px Anton", "#000000");
  
  // Message display
  spriteIndices.MES = spriteIndices.LOAD + 1;
  sprites[spriteIndices.MES] = new createjs.Text("Now loading...", Math.floor(30) + "px Roboto", "#000000");
  sprites[spriteIndices.MES].textAlign = "center";
  sprites[spriteIndices.MES].textBaseline = "middle";
  
  // Add all containers to stage
  for (let i = spriteIndices.BATTLE; i <= spriteIndices.MES; i++) {
    stage.addChild(sprites[i]);
  }
  
  // Create buttons
  const buttonTexts = ["START", "AI vs AI", "YES", "NO", "END TURN", "TITLE", "HISTORY", "SPECTATE"];
  spriteIndices.BTN = spriteIndices.MES + 1;
  for (let i = 0; i < buttonTexts.length; i++) {
    // Create button container
    const button = new createjs.Container();
    
    // Add button background
    const buttonBg = new createjs.MovieClip();
    buttonBg.gotoAndStop("btn");
    button.addChild(buttonBg);
    
    // Add button text
    const buttonText = new createjs.Text(buttonTexts[i], "32px Anton", "Black");
    buttonText.textAlign = "center";
    buttonText.textBaseline = "middle";
    button.addChild(buttonText);
    
    stage.addChild(button);
    sprites[spriteIndices.BTN + i] = button;
    button.visible = false;
  }
  
  // Set max sprite index
  spriteIndices.MAX = spriteIndices.BTN + buttonTexts.length;
  
  // Hide all UI elements initially
  for (let i = spriteIndices.INFO; i < spriteIndices.MAX; i++) {
    sprites[i].visible = false;
  }
}

/**
 * Create and initialize the battle animation
 * @param {createjs.Container} battleContainer - Container for battle animation 
 * @param {Array} battle - Battle data array
 */
export function renderBattleAnimation(battleContainer, battle) {
  // Clear existing children
  battleContainer.removeAllChildren();
  
  // Semi-transparent white background for battle display
  const background = new createjs.Shape();
  background.graphics.beginFill("rgba(255,255,255,0.8)").drawRect(-420, -50, 840, 360);
  battleContainer.addChild(background);
  
  // Create dice shadows and dice for both attacker (i=0) and defender (i=1)
  for (let i = 0; i < 2; i++) {
    // Create shadow sprites for visual effect
    for (let j = 0; j < 8; j++) {
      const shadow = new createjs.MovieClip();
      shadow.scaleX = shadow.scaleY = 0.15;
      shadow.name = `s${i}${j}`;  // Name format: s[player][index]
      battleContainer.addChild(shadow);
    }
    
    // Create dice sprites
    for (let j = 0; j < 8; j++) {
      const dice = new createjs.MovieClip();
      dice.scaleX = dice.scaleY = 0.15;
      dice.name = `d${i}${j}`;  // Name format: d[player][index]
      battleContainer.addChild(dice);
    }
    
    // Create text to display total dice value
    const sumText = new createjs.Text("0", "80px Anton", "Black");
    sumText.textBaseline = "middle";
    sumText.textAlign = "center";
    sumText.name = `n${i}`;  // Name format: n[player]
    battleContainer.addChild(sumText);
  }
  
  // Position the sum texts
  battleContainer.getChildByName("n0").x = 110;
  battleContainer.getChildByName("n0").y = -10;
  battleContainer.getChildByName("n1").x = -290;
  battleContainer.getChildByName("n1").y = -10;
}
