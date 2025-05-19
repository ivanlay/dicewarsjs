# Dicewars JS

This is a modern, enhanced version of [Dice Wars](https://www.gamedesign.jp/games/dicewars/), a strategic dice-based territory conquest game. The project builds upon:

👉 [**Play the game online**](https://ivanlay.github.io/dicewarsjs/) 👈

1. The original game from [gamedesign.jp](https://www.gamedesign.jp/games/dicewars/)
2. [Chris Raff's modification](https://github.com/chrisraff/dicewarsjs) that added custom AI capabilities

This fork significantly extends the project with:

- Modern JavaScript practices (ES6+ modules, webpack)
- Improved architecture and code organization
- Enhanced gameplay features and UI improvements
- Comprehensive documentation for players and developers
- Developer tooling and quality assurance

## Features

- Multiple AI players with different strategies
- Spectator mode to watch AI players compete
- Configurable game speed in spectator mode
- Mobile-friendly with touch support
- Responsive design that scales to fit your screen
- Battle history replay

## Usage

### Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the modern development server:

   ```bash
   npm run dev
   ```

3. To test the legacy build run:

   ```bash
   npm run dev:legacy
   ```

4. Open your browser at `http://localhost:3000`

### Production Build

Modern build:

```bash
npm run build
```

Legacy build:

```bash
npm run build:legacy
```

Build both at once:

```bash
npm run build:all
```

The optimized files will be available in the `dist` directory and can be deployed to any web server.

### Bundle Analysis

Generate a bundle report to inspect the contents of the production build:

```bash
npm run build:analyze
```

Open `dist/bundle-report.html` to view the visualization. To enforce bundle size limits, run:

```bash
npm run perf:check
```

### Game Modes

- **Player vs AI**: Test your strategy against various AI opponents (default)
- **AI vs AI**: Watch AI players compete against each other in spectator mode
- **Battle Speed**: Adjust game speed in spectator mode for faster analysis

You can select "AI vs AI" on the title screen to enter spectator mode.

## Make Your Own AI

This project makes it easy to develop and test custom AI strategies.

### Modern Method (Recommended)

1. Create a new file in the `src/ai` directory:

   ```javascript
   // src/ai/ai_YourName.js
   export function ai_YourName(game) {
     // Your AI implementation here
     return 0; // Return 0 when done with turn
   }
   ```

2. Register your AI in `src/ai/index.js`:

   ```javascript
   export { ai_YourName } from './ai_YourName.js';
   ```

3. Add your AI to the registry in `src/Game.js`:
   ```javascript
   this.aiRegistry = {
     // Existing AIs...
     ai_YourName: ai_YourName,
   };
   ```

### AI Implementation Guide

Your AI function receives the game state and needs to make decisions about which territories to attack:

```javascript
function ai_YourName(game) {
  // Example: Find a territory you own with dice > 1
  const myTerritories = game.adat.filter(area => area.arm === game.get_pn() && area.dice > 1);

  if (myTerritories.length === 0) return 0; // End turn if no valid moves

  // For each territory, check neighbors for potential attacks
  for (const myArea of myTerritories) {
    const areaId = game.adat.indexOf(myArea);

    // Find enemy neighbors
    for (let j = 0; j < game.adat.length; j++) {
      if (myArea.join[j] && game.adat[j].arm !== game.get_pn()) {
        // Evaluate if attack is favorable
        if (myArea.dice > game.adat[j].dice) {
          // Attack! Set source and target areas
          game.area_from = areaId;
          game.area_to = j;
          return; // Don't return a value to execute the attack
        }
      }
    }
  }

  return 0; // End turn when no good moves are found
}
```

### Game State Reference

- `game.adat`: Array of all territories
- `game.adat[i].arm`: Player ID who owns territory `i`
- `game.adat[i].dice`: Number of dice in territory `i`
- `game.adat[i].join[j]`: Returns 1 if territories `i` and `j` are adjacent, 0 otherwise
- `game.get_pn()`: Current player's ID
- `game.area_from`: Set to the ID of attacking territory
- `game.area_to`: Set to the ID of defending territory

### Testing Your AI

You can test your AI by:

1. Changing the player assignments in `Game.js`
2. Using spectator mode to watch your AI compete against others
3. Analyzing performance statistics (if enabled)

## Configuration

Game settings can be configured through the settings UI or by editing configuration files:

```javascript
// Example configuration in src/config.js
export const GAME_CONFIG = {
  playerCount: 8, // Number of players (2-8)
  humanPlayerIndex: 0, // Set to null for AI vs AI mode
  spectatorSpeedMultiplier: 3, // Game speed in spectator mode
  soundEnabled: true, // Enable/disable game sounds
  battleHistoryLength: 10, // Number of battles to keep in history
  showProbabilities: true, // Show attack success probability
  territoriesCount: 40, // Number of territories
  maxDice: 8, // Maximum dice per territory
};
```

## Project Architecture

This project uses a modern architecture that bridges legacy code with new ES6+ practices:

```
dicewarsjs/
├── src/                     # Source files (modern ES6 code)
│   ├── ai/                  # AI implementations
│   ├── components/          # UI components
│   ├── utils/               # Utility functions
│   ├── game.js              # Game logic
│   └── index.js             # Entry point
├── dist/                    # Production build output
├── public/                  # Static assets
├── docs/                    # Documentation
│   ├── ai-strategies/       # AI strategy documentation
│   └── ...                  # Other documentation
├── webpack.common.js        # Shared webpack configuration
├── webpack.legacy.js        # Legacy build config (defer scripts)
├── webpack.modern.js        # Modern ES module build config
├── .eslintrc.js             # ESLint configuration
└── package.json             # Dependencies and scripts
```

### Bridge Architecture

The project uses a bridge pattern to transition from legacy code to modern JavaScript:

1. **Modern Code**: New code is written using ES6 modules and modern practices
2. **Legacy Compatibility**: Bridge modules expose newer code to legacy code
3. **Incremental Migration**: Allows gradual modernization without breaking changes

For more details, see [BRIDGE_ARCHITECTURE.md](./docs/BRIDGE_ARCHITECTURE.md).

## Development Workflow

### Available Scripts

```bash
# Start development server
npm run dev

# Start legacy development server
npm run dev:legacy

# Build for production
npm run build

# Build legacy bundle
npm run build:legacy

# Build both bundles
npm run build:all

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Pre-commit Checklist

Before committing any changes, ensure all quality checks pass:

1. **Run Tests**: All tests must pass

   ```bash
   npm test
   ```

   Expected result: All tests pass with no failures

2. **Format Code**: Ensure code formatting is consistent

   ```bash
   npm run format
   ```

   This will automatically format your code using Prettier

3. **Check Linting**: No linting errors should be present

   ```bash
   npm run lint
   ```

   Expected result: No errors (warnings are acceptable but should be minimized)

   To automatically fix linting issues:

   ```bash
   npm run lint:fix
   ```

4. **Verify Build**: Ensure the project builds successfully
   ```bash
   npm run build
   ```
   Expected result: Build completes without errors

If any of these checks fail, fix the issues before committing your changes. This ensures code quality and prevents breaking the build for other developers.

### Code Quality Tools

- **ESLint**: Enforces coding standards
- **Prettier**: Ensures consistent code formatting
- **Jest**: For unit and integration testing
- **Webpack**: Bundles and optimizes code

Pre-commit hooks automatically format and lint changed files.

## Roadmap Highlights

See [ROADMAP.md](./docs/ROADMAP.md) for the detailed development roadmap.

- Complete ES6 modernization of game components
- Add AI performance testing and statistics
- Implement online multiplayer capability
- Add saving and loading game states
- Expand AI strategies and improve AI decision making

## Available AI Types

Several AI implementations are included to demonstrate different strategies:

- **Example AI** (`ai_example.js`): Basic implementation to learn from
- **Default AI** (`ai_default.js`): Original game's AI strategy
- **Defensive AI** (`ai_defensive.js`): Prioritizes protecting vulnerable territories
- **Adaptive AI** (`ai_adaptive.js`): Adjusts strategy based on game state

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- [**AI Developer Guide**](./docs/ai/DEVELOPER_GUIDE.md): Detailed guide for AI development
- [**Bridge Architecture**](./docs/BRIDGE_ARCHITECTURE.md): Details on the architectural approach
- [**Roadmap**](./docs/ROADMAP.md): Future development plans
- [**Code Style Guide**](./docs/CODE_STYLE.md): Coding standards and conventions
- [**Testing Strategy**](./docs/TESTING.md): Testing approach and implementation

## Module Federation

DiceWarsJS can participate in a module federation setup. It can expose its AI
modules as a **remote** or consume them as a **host**.

### Run as a remote

Start the development server with the `role` set to `remote` and optionally
specify a port (defaults to `3000`):

```bash
npm run dev -- --env role=remote --env port=3001
```

This generates `remoteEntry.js` and exposes modules like `./AI` and `./Game`.

### Run as a host

To consume modules from another running instance, set the `role` to `host` and
provide the remote URL:

```bash
npm run dev -- --env role=host --env remoteUrl=http://localhost:3001
```

The host application will load the exposed modules from the remote instance at
the given URL.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

If you create a cool new AI strategy, please share it with the community!

## License

[MIT](LICENSE) - Feel free to use, modify, and distribute this code.

## Acknowledgments

- Original game design by [GameDesign.jp](https://www.gamedesign.jp/games/dicewars/)
- Initial JavaScript implementation by [Chris Raff](https://github.com/chrisraff/dicewarsjs)
