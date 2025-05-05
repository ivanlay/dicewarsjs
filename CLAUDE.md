# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Project

- Run `npm run serve` to start a local development server
- Open `http://localhost:3000` in a web browser to run the game
- A build process is required with `npm run build` for production builds
- AI vs AI testing can be enabled through the configuration system

## Architecture

The project uses a hybrid architecture combining modern ES6 modules with legacy global scope code:

- Modern code uses ES6 modules with `import`/`export` statements
- Legacy code uses global variables (attached to the `window` object)
- A bridge pattern connects these two systems, exposing ES6 module functionality to global scope
- The initialization sequence is critical - game-loader.js sets up globals before other scripts run

## File Structure

The project uses a mixed module-based/legacy structure:

- `/src/` - Modern ES6 module source code
  - `/ai/` - AI implementations (ES6 modules)
  - `/bridge/` - Code that bridges modern and legacy systems
  - `/models/` - Game data structures (ES6 classes)
  - `/utils/` - Utility functions and configuration
  - `/mechanics/` - Game rules and logic
  - `Game.js` - Modern game class implementation
  - `game-loader.js` - Initializes global objects for legacy code
- Root directory - Legacy code files
  - `main.js` - Legacy game initialization and rendering
  - `*.js` files - Legacy game components
- `/docs/` - Documentation including AI strategy guides
- `/sound/` - Sound effects

## Code Style Guidelines

### Modern and Legacy Code Styles

The project contains both modern and legacy code:

- **Modern Code (in /src/)**:
  - Uses ES modules with `import`/`export` statements
  - Uses ES6 classes and modern JS features
  - Follows structured organization with clear separation of concerns
  
- **Legacy Code (in root directory)**:
  - Uses global scope and attaches to `window` object
  - Uses traditional constructor functions instead of classes
  - More procedural in style with less strict organization
  - Relies on execution order for proper initialization

### General Guidelines

- **ESLint & Prettier**: Project uses ESLint and Prettier for code quality and formatting
- **ES6+ Features**: Use optional chaining (?.) and nullish coalescing (??) for safer code
- **Naming**:
  - CamelCase for variables and functions (e.g., `areaFrom`, `getPn()`)
  - Use descriptive names that clearly convey purpose
  - Legacy AI modules use snake_case naming (`ai_default.js`) and are exempted from camelCase rules
- **Line length**: Keep under 100 characters where possible
- **Comments**: Use JSDoc-style comments for function documentation
- **Whitespace**: Use 2 spaces for indentation
- **Classes**: Use ES6 class syntax for new code
- **Game constants**: Define in the configuration system for flexibility

### Defensive Programming

When working with the bridge between modern and legacy code:

- Use explicit `window.` namespace for global variables
- Add null checks before accessing properties of global objects
- Provide fallbacks for critical objects if they aren't defined
- Use protective initialization patterns like `window.obj = window.obj || {}`
- Be careful with script loading order to ensure dependencies are met
- Add explicit type attributes to script tags (`type="text/javascript"`)

### ESLint Customizations

- File extensions in imports are allowed (e.g., `import x from './file.js'`)
- Underscore dangle for private fields is permitted in enhanced models (e.g., `this._privateField`)
- The increment operator (`++`) and `continue` statements are allowed in game logic loops
- `for...of` statements are permitted for simpler iteration code
- Private class fields with # prefix are used in enhanced models (e.g., `#privateField`)
- CreateJS is defined as a global variable for the rendering system
- Custom code for a game engine prioritizes readability over strict adherence to all ESLint rules

Detailed code style guidelines are available in `docs/CODE_STYLE.md`.

## AI Development Guidelines

When implementing new AI strategies:

1. Create a new file in `/src/ai/` (e.g., `ai_mynewstrategy.js`)
2. Export a main function that accepts the game object
3. Add the export to `src/ai/index.js`
4. Add the AI to the registry in `Game.js`
5. Update the configuration in `src/utils/config.js` to use the new AI

## Configuration System

- The game uses a configuration system in `src/utils/config.js`
- AI configurations are managed through the `aiTypes` array
- To use a custom configuration, modify the DEFAULT_CONFIG object
- The configuration system supports:
  - Player settings (count, human player position)
  - AI assignments
  - Display settings
  - Game rules

## Testing and Verification

Before creating a pull request:

1. Run `npm run lint` and `npm run format` to ensure code style consistency
2. Run `npm run build` to verify that the project builds correctly
3. Run `npm test` to run the test suite
4. Run `npm run serve` and test the game in the browser
5. Verify that your changes maintain bridge compatibility between modern and legacy code
6. Check for console errors during initialization and gameplay
7. Test with all existing AIs to ensure compatibility
8. Verify that your changes don't break existing game mechanics
9. For new AIs, test various game scenarios (early game, mid game, endgame)
10. If adding new features, update relevant documentation

### Important Testing Considerations for Hybrid Architecture

When testing changes to the bridge or initialization code:

1. Check the browser console for initialization errors
2. Verify that global objects are properly defined in the correct sequence
3. Test with different browsers to ensure compatibility
4. Check that the game-loader.js file is properly included in the build
5. Verify that script loading order is maintained in the generated HTML

### Note on Linting

- Run `npm run lint:fix` to automatically fix linting issues
- Some linting rules are relaxed to accommodate game development patterns
- Pre-commit hooks verify your code meets the project's style requirements

GitHub Actions will automatically run these checks on every push and pull request to ensure code quality.

## Key Libraries and Dependencies

- **CreateJS** - Canvas rendering and animation library
- **Webpack** - Module bundler for modern code
- **ESLint/Prettier** - Code quality and formatting
- **Jest** - Testing framework
- **serve** - Development server

## Initialization Sequence

The game's initialization sequence is critical:

1. CreateJS loads first (from CDN)
2. game-loader.js initializes essential global objects
3. Legacy library scripts (areadice.js, mc.js) load
4. Webpack bundles with modern code load
5. main.js initializes the game using objects from all previous scripts

## Commands and Development Workflow

- `npm run serve` - Start a development server at http://localhost:3000
- `npm run build` - Create a production build in /dist
- `npm run lint` - Check for code style issues
- `npm run lint:fix` - Automatically fix linting issues
- `npm run format` - Format code with Prettier
- `npm test` - Run the test suite
- `npm run benchmark` - Run AI performance tests

### Development Tips

- Always check browser console for initialization errors
- Use the Browser's Developer Tools to debug game-loader.js and script loading
- When modifying the bridge between modern and legacy code, test thoroughly
- When implementing new AIs, always test in-game before committing
- Follow semantic versioning for commit messages

## Continuous Integration

The project uses GitHub Actions for continuous integration:

- Workflow defined in `.github/workflows/ci.yml`
- CI runs on every push to master and on pull requests
- Tests run against Node.js 16.x and 18.x
- The workflow includes:
  - Dependency installation
  - Code formatting verification
  - Linting checks
  - Build process
  - Test execution
  - Benchmark tests

See `docs/CI_CD.md` for detailed information.
