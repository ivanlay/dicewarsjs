# DiceWarsJS Project Roadmap

This document outlines the current development status, immediate next steps, and long-term vision for the DiceWarsJS project.

## Recent Accomplishments

1. **Fixed Development Environment Configuration**

   - Changed package.json `serve` script to use webpack-dev-server
   - Updated webpack config to use consistent runtime chunk naming
   - Fixed 404 errors for bundle files and game-loader.js
   - Fixed sound loading "Type not recognized" errors
   - Fixed "AI function not found for player 0" in AI vs AI mode

2. **Improved AI Bridge Initialization**

   - Created `game-loader.js` for initializing global AI functions
   - Updated HTML to load game-loader.js before other scripts
   - Fixed "AI function not found" warnings
   - Implemented proper AI configuration in both legacy and modern systems

3. **Sound System Enhancement**
   - Added event listener to initialize AudioContext on user gesture
   - Implemented proper sound system initialization sequence
   - Changed dynamic imports to direct file paths
   - Added explicit file type indication for CreateJS Sound API

## Short-Term Action Items

### 1. Optimize Bridge Layer and Legacy Integration

As the project continues to modernize, consider these steps:

- Remove bridge dependencies that can be safely migrated
- Keep stable bridge interfaces for unmigrateable components (like mc.js)
- Transition global variables to module exports/imports where possible
- Refactor main.js to use ES6 module structure as much as possible
- Update AI systems to fully rely on ES6 modules while maintaining compatibility

### 2. Update AI Loading System

The current fix is a workaround for the immediate issue. A more robust solution would:

- Modify Game.js to better handle the ES6 module system
- Create an AIRegistry class to manage different AI strategies
- Implement a dynamic loading system for AI modules
- Add unit tests specifically for AI registration and usage

```javascript
// Example of a more robust AI registry
class AIRegistry {
  constructor() {
    this.strategies = new Map();
    this.defaultStrategy = null;
  }

  register(name, aiFunction) {
    this.strategies.set(name, aiFunction);
    return this;
  }

  setDefault(name) {
    if (this.strategies.has(name)) {
      this.defaultStrategy = this.strategies.get(name);
    }
    return this;
  }

  get(name) {
    if (!name || !this.strategies.has(name)) {
      return this.defaultStrategy;
    }
    return this.strategies.get(name);
  }
}
```

### 3. Improve Build System

- Add distinct development and production build configurations
- Implement proper source maps for easier debugging
- Add bundle size analysis and optimization
- Implement code splitting for better performance
- Consider adding TypeScript for better type safety

### 4. Update Documentation

- Add detailed comments about the bridge layer functionality
- Create a migration guide for moving to full ES6 modules
- Consolidate documentation files for better organization
- Update architecture diagrams for new developers

### 5. Testing Improvements

- Add integration tests for the bridge layer
- Test AI loading under different conditions
- Implement automated browser testing with Puppeteer or Playwright
- Add performance benchmarks for different AI strategies

## Medium-Term Goals

### 1. Complete the Modularization Process

1. Convert main game components to modules:

   - Move game.js functionality to ES6 module (in progress with /src/Game.js)
   - Refactor rendering logic into separate modules
   - Create dedicated modules for game state management

2. Convert AI implementations:

   - Finish migrating AI logic to ES6 modules (in progress with /src/ai/ directory)
   - Standardize AI interface
   - Create a registry for AI strategies

3. Implement utility modules:
   - Create utility modules for common functions
   - Implement proper configuration management (started with /src/utils/config.js)
   - Add sound management module

### 2. Modernize the Code

1. Update syntax:

   - Replace var with const/let
   - Convert functions to arrow functions where appropriate
   - Use template literals instead of string concatenation
   - Implement classes for game entities

2. Use modern JavaScript features:

   - Implement destructuring assignments
   - Use spread/rest operators
   - Add default parameters
   - Utilize array/object methods like map, filter, reduce

3. Improve data structures:
   - Replace simple arrays with Maps or Sets where appropriate
   - Consider typed arrays for performance optimization
   - Use proper encapsulation with classes

### 3. Create a Proper Build Pipeline

1. Set up asset management:

   - Configure loaders for images, sounds, etc.
   - Implement proper asset optimization

2. Add code optimization:
   - Set up minification for production builds
   - Configure tree-shaking to eliminate unused code
   - Implement code splitting if necessary

### 4. Update Game Infrastructure

1. Implement proper game loop:

   - Refactor from CreateJS timer to requestAnimationFrame
   - Separate render and update loops

2. Modernize rendering:

   - Consider canvas API abstractions
   - Implement proper rendering pipeline

3. Add proper event handling:
   - Replace direct DOM event handling with a more structured approach
   - Implement an event bus if needed

## Long-Term Vision

### 1. Strategy for Unmigrateable Legacy Code

Some files in the codebase (like mc.js) may never be fully migrateable to ES6 modules since they were originally generated from Adobe Flash. To handle this reality:

- **Establish clear boundaries**: Create stable interfaces between legacy and modern code
- **Use the adapter pattern**: Build wrapper classes/functions around legacy components
- **Implement proxy objects**: Modern ES6 code that communicates with legacy systems
- **Dependency injection**: Pass modern components into legacy code rather than direct access
- **Documentation**: Clearly mark which files must remain as legacy code

```javascript
// Example of an adapter for mc.js (Flash-generated code)
export class MCAdapter {
  constructor() {
    // Ensure MC is available globally
    if (!window.MC) {
      throw new Error('MC not initialized');
    }
    this.mc = window.MC;
  }

  // Modern ES6 methods that wrap legacy functionality
  drawElement(element, properties) {
    // Call legacy methods with appropriate parameters
    this.mc.drawElement(element, properties);
    return this;
  }

  // Event system to bridge between legacy and modern code
  addEventListener(event, callback) {
    // Set up legacy event handler that calls modern callback
    this.mc.setEventHandler(event, (...args) => {
      callback(...args);
    });
  }
}
```

### 2. Complete Transformation and New Features

- Complete transition to modern ES6 modules where possible
- Establish stable interfaces for unmigrateable legacy code
- Remove dependency on global variables where possible
- Improve code organization with proper separation of concerns
- Enhance AI strategies with more sophisticated algorithms
- Consider implementing multiplayer capabilities
- Add AI championship mode for comparing strategy performance
- Create a version of the game that automatically plays AI against each other for statistical analysis
- Add replay and game state saving functionality

### 3. Final Migration Steps

1. Remove legacy files:

   - Once modules are fully implemented, remove old versions
   - Update import references

2. Update index.html:

   - Replace individual script tags with bundled output
   - Add proper meta tags for modern web

3. Clean up transitional code:
   - Remove bridge implementations (where possible)
   - Finalize module interfaces
