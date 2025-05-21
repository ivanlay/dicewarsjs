# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

> **Note**: This file mirrors CLAUDE.md to ensure all AI agents work from the same best practices and have consistent understanding of the project.

**Important Project Status Update:** The project's ES6 migration plan and roadmap have been recently updated (see `docs/ES6_MIGRATION_PLAN.md` and `docs/ROADMAP.md`). Please refer to these documents for the latest architectural goals and migration strategies when assisting with code changes.

## Git Workflow Preferences

When working with git:

- Provide git commands for users to run manually rather than executing git commits directly
- This allows users to maintain control over commit messages and authorship
- For example, provide the `git add` and `git commit` commands for manual execution

## Build and Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Generate bundle analysis report
npm run analyze

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run benchmarks
npm run benchmark

# Run full benchmark suite
npm run benchmark:full

# Check for linting issues
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

## Code Quality Requirements

Before completing any task, always ensure:

1. **Tests Pass**: Run `npm test` to verify all tests pass
2. **Linting**: Run `npm run lint` to check for code quality issues
3. **Coverage**: Maintain test coverage above 60% (run `npm run test:coverage`)
4. **Build Verification**: Run `npm run build` to ensure the project builds successfully

When test failures occur:

- First run tests to see what's failing
- Fix any broken tests before making other changes
- Add new tests when implementing features

## Project Architecture

DiceWarsJS is a turn-based strategy game where players compete to conquer territories on a hexagonal grid using dice for attack and defense. The project is in the process of transitioning from legacy JavaScript to modern ES6 modules.

### Hybrid Architecture

The codebase uses a hybrid architecture with three main components:

1. **Legacy Code**: Original implementation with global variables/functions in the root directory (game.js, main.js, ai\_\*.js).

2. **Modern ES6 Modules**: Structured code with proper imports/exports in the src/ directory.

3. **Bridge Pattern**: Connects legacy code with ES6 modules by exposing modern functionality to the global scope (src/bridge/).

### Core Components

- **Game Engine** (src/Game.js): Manages game state, player turns, territory ownership, and dice placement.

- **AI System** (src/ai/): Contains different AI strategies:

  - ai_default: Balanced approach from the original game
  - ai_defensive: Prioritizes protecting vulnerable territories
  - ai_example: Basic implementation for educational purposes
  - ai_adaptive: Adapts strategy based on game conditions

- **Map Generation** (src/mechanics/mapGenerator.js): Creates the hexagonal grid and territories.

- **Battle Resolution** (src/mechanics/battleResolution.js): Handles attack resolution and dice distribution.

- **State Management** (src/state/): Contains immutable data structures for game state.

- **Models** (src/models/): Data structures for game entities (Area, Player, Battle).

- **Error Handling** (src/mechanics/errors/): Custom error classes for different error types.

### Important Design Patterns

1. **Bridge Pattern**: Used for transitioning between legacy and modern code. Bridge modules import from ES6 modules and expose functionality to both global scope (for legacy code) and as ES6 exports (for modern code).

2. **Immutable Data**: The state directory implements immutable data patterns for the game state.

3. **Factory Functions**: Used throughout the codebase to create game objects.

4. **Error Hierarchy**: Custom error classes (GameError, BattleError, TerritoryError, etc.) provide structured error handling.

### AI Implementation Notes

When working with AI strategies:

1. All AI functions must return 0 when they have no more moves to make (ends their turn).
2. AI functions perform attacks by setting `game.area_from` and `game.area_to` properties.
3. AI functions have access to the full game state through the game object parameter.
4. The AI system is designed to be extensible - new strategies can be added by creating a new file in src/ai/.

### Testing Approach

1. Unit tests for individual components (AI strategies, map generation, battle resolution).
2. Integration tests for the bridge components.
3. Performance tests for comparing AI strategies.
4. Test utilities and mocks are located in the tests/mocks/ directory.
5. Error handling should be tested thoroughly, including edge cases.

## Best Practices

1. **Code Style**: Follow existing code patterns and conventions
2. **Documentation**: Update relevant documentation when making significant changes
3. **Error Handling**: Use appropriate custom error classes from src/mechanics/errors/
4. **Testing**: Write tests for new functionality and ensure existing tests pass
5. **Commit Messages**: Use conventional commit format (e.g., "feat:", "fix:", "test:", "docs:")

## Common Pitfalls to Avoid

1. Don't modify legacy files unless specifically required
2. Always run tests before suggesting code is complete
3. Maintain the bridge pattern when adding new functionality
4. Ensure error events are properly emitted for error tracking
5. Keep AI functions pure and deterministic for testing

## Documentation Updates

When making changes:

1. Update inline code comments for clarity
2. Update relevant docs in the docs/ directory
3. Update this AGENTS.md file if workflow changes
4. Update CLAUDE.md to maintain parity between agent guidance files
5. Keep README.md synchronized with new features

## Agent-Specific Guidelines

- This file is designed to work with various AI coding assistants
- The guidance provided here should enable consistent, high-quality contributions
- Always prioritize code safety and maintainability over clever solutions
- When in doubt, ask for clarification rather than making assumptions

## Keeping Agent Files Synchronized

This file (AGENTS.md) and CLAUDE.md should be kept in sync to ensure all AI assistants have the same understanding of:

- Project architecture
- Development workflows
- Best practices
- Testing requirements
- Documentation standards

When updating either file, consider whether the change should be reflected in both.
