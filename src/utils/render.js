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
    '#FF0000'  // Red
  ],
  TERRITORY: {
    BORDER: '#000000',           // Territory border
    HIGHLIGHT_ATTACK: '#FF0000', // Attack source highlight
    HIGHLIGHT_TARGET: '#0000FF'  // Attack target highlight
  },
  UI: {
    BACKGROUND: '#FFFFFF',       // Background color
    TEXT: '#000000',             // Default text color
    BUTTON: '#EEEEEE',           // Button background
    BUTTON_HOVER: '#DDDDDD',     // Button hover state
    BUTTON_TEXT: '#000000',      // Button text
    MESSAGE: '#000000'           // Message text
  }
};

/**
 * Scale a number based on current display scale
 * @param {number} n - Number to scale
 * @returns {number} Scaled value
 */
export const scaleValue = (n) => {
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
export const createText = (text, x, y, color = '#000000', font = '20px Arial', align = 'center') => {
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
export const createButtonShape = (x, y, width, height, color = COLORS.UI.BUTTON, cornerRadius = 5) => {
  const button = new createjs.Shape();
  const scaledX = scaleValue(x);
  const scaledY = scaleValue(y);
  const scaledWidth = scaleValue(width);
  const scaledHeight = scaleValue(height);
  
  button.graphics.beginFill(color)
    .drawRoundRect(0, 0, scaledWidth, scaledHeight, cornerRadius);
  
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
    buttonShape.graphics.clear().beginFill(COLORS.UI.BUTTON_HOVER)
      .drawRoundRect(0, 0, scaleValue(width), scaleValue(height), 5);
  });
  
  container.on('mouseout', () => {
    buttonShape.graphics.clear().beginFill(COLORS.UI.BUTTON)
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
export const drawHexCell = (graphics, x, y, radius, fillColor = null, strokeColor = '#000000', strokeWidth = 1) => {
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
  // This is a placeholder implementation
  // The actual implementation would depend on the specific hex grid visualization
  
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
export const createDiceSpriteSheet = (playerCount, maxDice) => {
  return new Promise((resolve) => {
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
};

/**
 * Draw dice pips in a container
 * @param {createjs.Container} container - Container to draw in
 * @param {number} count - Number of pips to draw
 * @param {string} color - Color of the pips
 */
const drawDicePips = (container, count, color) => {
  const positions = [
    [0, 0],       // Center (for odd numbers)
    [-10, -10],   // Top left
    [10, 10],     // Bottom right
    [10, -10],    // Top right
    [-10, 10],    // Bottom left
    [-10, 0],     // Middle left
    [10, 0],      // Middle right
    [0, -10],     // Middle top
    [0, 10]       // Middle bottom
  ];
  
  // Add pips based on dice patterns
  for (let i = 0; i < count && i < positions.length; i++) {
    const [x, y] = positions[i];
    
    const pip = new createjs.Shape();
    pip.graphics.beginFill(color)
      .drawCircle(x, y, 4);
    
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
  bg.graphics.beginFill(color)
    .drawRoundRect(0, 0, 100, 30, 5);
  
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