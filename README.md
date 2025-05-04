# Dicewars JS

Play my version [here](https://www.chrisraff.com/dicewars/). My slightly improved AI are the pink, green and lime player.

This is a modification of the game [Dice Wars](https://www.gamedesign.jp/games/dicewars/) from gamedesign.jp. I have added the ability to have multiple types of AI so I could try to create my own AI for the game.

## Features

- Multiple AI players with different strategies
- Spectator mode to watch AI players compete
- Configurable game speed in spectator mode
- Mobile-friendly with touch support
- Responsive design that scales to fit your screen
- Battle history replay

## Usage

### Using the Development Server

The project now uses a modern build system with webpack. To run the game:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:8080`

### Building for Production

To create an optimized production build:

```bash
npm run build
```

The production files will be available in the `dist` directory and can be deployed to any web server.

### Legacy Method

If you prefer not to use the build system, you can still use the legacy method:
Navigate to `file:///Drive:/the/directory/you/cloned/it/to/index.html` in any web browser on your computer (For instance, `file:///C:/Users/USERNAME/Downloads/dicewarsjs/index.html`).

### Game Modes

The game offers two main modes:
- **Normal Mode**: Play against AI opponents (default)
- **AI vs AI Mode**: Watch AI players compete against each other
  
You can select "AI vs AI" on the title screen to watch the AI players battle without human intervention.

## Make Your Own AI

### Using the ES6 Module System (Recommended)

1. Create a new file in the `src/ai` directory named `ai_YourName.js` using one of the existing AI files as a template.

2. Export your AI function:
   ```javascript
   export function ai_YourName(game) {
     // Your AI implementation here
     return 0; // Return 0 when done with turn
   }
   ```

3. Add your AI to the registry in `src/ai/index.js`:
   ```javascript
   export { ai_YourName } from './ai_YourName.js';
   ```

4. Register your AI in the Game class's aiRegistry in `src/Game.js`:
   ```javascript
   this.aiRegistry = {
     // Existing AIs...
     ai_YourName: ai_YourName
   };
   ```

5. Assign your AI to a player:
   ```javascript
   this.ai = [
     null,        // Player 0 (human player)
     ai_YourName, // Player 1
     // Other players...
   ];
   ```

### Using the Legacy System

1. Copy one of the existing AI files, such as `ai_example.js`, and name it `ai_YourName.js`. Change the file's function to also be named `ai_YourName`

2. In `index.html` at line 39 where the other AI scripts are added, add a line for `ai_YourName.js` 

3. Go to line 42 of `game.js` where the array `this.ai` is defined. Change some of the items in the array to `ai_YourName`, which is the function in your AI's script. The first player is always the human player, so leave it as null.

### General AI Development Notes

* The index of the array corresponds to the color of the player in the game. The human (first) player is always purple, the second index is always lime, then green, pink, orange, cyan, yellow, and red.
* The order of play is shuffled in game, but the player colors always correspond to the order of `this.ai`
* It may be useful to set your AI as the second player so you can play against it in a two player game

#### AI Implementation Guide

* The code and comments in `ai_example.js` give a basic outline for how to declare a move
* To declare an attack, set `game.area_from` to the id of the attacking region and `game.area_to` to the defending region's id (do not return). Once you have no good moves left, end the player's turn by returning 0.
* `game.adat` is the array of regions.
* `game.adat[i].arm` is the id of the player who owns the region, and `game.get_pn()` returns the id of the player whose turn it is.
* `game.adat[i].dice` is the number of dice the region has
* `game.adat[i].join[j]` is true (1) when region `i` is adjacent to region `j` and false (0) otherwise.

## Configuration

The game now supports configuration options through a config file:

1. To enable spectator mode where AI plays against AI, you can either:
   - Click the "AI vs AI" button on the title screen (recommended)
   - Or set the human player index to null in the configuration
2. You can adjust the game speed in spectator mode using the speed multiplier setting

Sample configuration:
```javascript
// In your config file
const GAME_CONFIG = {
  humanPlayerIndex: null, // Set to null for AI vs AI spectator mode
  spectatorSpeedMultiplier: 3 // Make the game run 3x faster in spectator mode
};
```

## Available AI Types

The repository includes several AI implementations with different strategies:

- `ai_example.js`: A basic example AI with simple decision-making
- `ai_defensive.js`: A more defensive strategy that prioritizes protecting vulnerable territories
- `ai_default.js`: The default AI strategy from the original game
- `ai_adaptive.js`: A newer AI that adapts its strategy based on game conditions

## Contributing

If you make a cool new AI, let me know!

## Recent Changes

- Added modern build system with webpack and Babel
- Implemented ES6 module structure throughout the codebase
- Added development server with hot reloading
- Updated README with new build instructions
- Added direct "AI vs AI" button on the title screen for easy spectator mode access
- Fixed TITLE button positioning and functionality in AI vs AI mode
- Ensured proper game mode separation between normal play and AI vs AI
- Fixed compatibility issues with module structure by adding bridge files
- Added adaptive AI strategy with improved decision-making
- Refactored to use modern ES6 structure
- Added configuration system and spectator mode
- Added game speed controls for spectator mode
- Fixed issues with AI player selection

## Planned Improvements

I plan to make a version of the game that just plays the AI against themselves quickly so you can get statistics on how well each AI performs.

## License

[MIT](https://choosealicense.com/licenses/mit/)