# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Project

- Open `index.html` in a web browser to run the game
- No build process is required; this is a pure JavaScript project that runs in the browser
- AI vs AI testing can be enabled through the configuration system

## File Structure

The project uses a modern module-based structure:

- `/src/` - Main source code directory
  - `/ai/` - AI implementations
  - `/models/` - Game data structures
  - `/utils/` - Utility functions and configuration
  - `Game.js` - Core game logic and state management
  - `main.js` - Rendering and UI interaction
- `/docs/` - Documentation including AI strategy guides
- `/sound/` - Sound effects

## Code Style Guidelines

- **Modern JS**: Uses ES modules with import/export
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
- **ESLint Customizations**:
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
4. Test with all existing AIs to ensure compatibility
5. Verify that your changes don't break existing game mechanics
6. For new AIs, test various game scenarios (early game, mid game, endgame)
7. Check browser console for any error messages
8. If adding new features, update relevant documentation

Note on linting:

- Run `npm run lint:fix` to automatically fix linting issues
- Some linting rules are relaxed to accommodate game development patterns
- Pre-commit hooks verify your code meets the project's style requirements

GitHub Actions will automatically run these checks on every push and pull request to ensure code quality.

## Default Code Imports

- Uses ES modules for code organization
- Uses CreateJS for canvas rendering

## Commits and Command Usage

- Run `npm run lint` to check for code style issues
- Run `npm run lint:fix` to automatically fix linting issues
- Run `npm run format` to format code with Prettier
- Run `npm test` to run the test suite
- Run `npm run build` to create a production build
- Pre-commit hooks will automatically lint and format staged files
- Follow semantic versioning for commit messages
- When implementing new AIs, always test in-game before committing

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
