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

4. **Phase 1 Code Audit Completed**
   - Documented remaining legacy scripts and global variables
   - Mapped bridge modules that expose ES6 modules globally
   - Recorded ES6 counterparts for all legacy files

## Comprehensive ES6 Migration Plan

### Phase 1: Assessment and Planning

1. **Complete Code Audit**

   - Map all remaining global variables and functions that need migration
   - Identify interdependencies between legacy and modern code
   - Document which files are using the bridge pattern and their current state
   - Create a dependency graph to visualize the migration path

2. **Establish Migration Priorities**
   - Prioritize components based on complexity, dependencies, and strategic value
   - Create a detailed component-by-component migration schedule
   - Define success criteria for each migration phase
   - Establish measurable goals and performance benchmarks

### Phase 2: Infrastructure and Environment Setup

1. **Enhance Testing Infrastructure**

   - Create comprehensive tests for all bridge components
   - Implement integration tests to verify bridge functionality
   - Set up automated tests to verify backwards compatibility
   - See [PHASE2_TESTING_PLAN.md](./PHASE2_TESTING_PLAN.md) for the detailed testing roadmap

2. **Refine Build Pipeline**
   - Optimize webpack configuration for faster development builds
   - Configure distinct development and production builds
   - Implement proper source maps for debugging
   - Set up bundle size analysis with size limits

### Phase 3: Core Components Migration

1. **Complete Game State Management**

   - Finish implementation of immutable state patterns
   - Add proper undo/redo functionality
   - Implement event system for state changes

2. **Migrate Map Generation and Battle Resolution**

   - Convert to ES6 modules with proper exports
   - Implement TypedArray-based grid representation
   - Create proper battle history tracking

3. **Migrate Event System**
   - Create ES6 event system to replace direct function calls
   - Implement pub/sub pattern for game events
   - Create bridge for legacy event handling

### Phase 4: UI and Interaction Migration

1. **Modernize Rendering Pipeline**

   - Complete transition from global render functions to module-based
   - Implement canvas abstraction layer
   - Separate render logic from game state

2. **Update Input Handling and UI Components**
   - Replace direct DOM event handlers with proper event system
   - Convert hardcoded UI to component-based approach
   - Implement proper UI state management

### Phase 5: Error Handling and Optimization

1. **Implement Error Boundaries**

   - Create proper error handling system
   - Add graceful degradation for critical components
   - Implement logging and error reporting

2. **Performance Optimization**
   - Apply TypedArrays for performance-critical operations
   - Implement Map and Set data structures where appropriate
   - Optimize rendering loop and memory management

### Phase 6: Bridge Reduction

1. **Identify Safe Bridge Removals**

   - Analyze bridge component usage
   - Create a list of safe bridge removals
   - Document impact and risks

2. **Implement Direct Module References**
   - Replace bridge imports with direct module imports
   - Update code to use ES6 module exports directly
   - Clean up global namespace gradually

### Phase 7: Unmigratable Code Strategy

1. **Identify Legacy Code Boundaries**

   - Document which components must remain as legacy code
   - Create stable interfaces for these components
   - Implement proper adapter pattern

2. **Create Legacy Adapters**
   - Develop wrapper classes for legacy components
   - Implement proxy objects for legacy interfaces
   - Isolate legacy dependencies

### Phase 8: Documentation and Cleanup

1. **Update Development Documentation**

   - Create detailed architecture documents
   - Update API references
   - Provide migration notes for remaining tasks

2. **Code Cleanup**
   - Remove dead code
   - Standardize naming conventions
   - Apply consistent formatting

### Phase 9: Final Bridge Removal

1. **Remove Bridge Components**

   - Once direct module imports are used consistently, remove bridge modules
   - Update any remaining references
   - Test extensively

2. **Update Entry Points**
   - Update HTML to use bundled module
   - Remove legacy script loading
   - Finalize webpack configuration

## Success Metrics

1. **Zero global variables** except those absolutely required
2. **100% ES6 module coverage** for all new and migrated code
3. **Improved bundle size** and loading performance
4. **Complete test coverage** for all migrated components
5. **Identical game behavior** before and after migration
6. **Simplified dependency graph** with clear module boundaries

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

### 1. Strategy for Unmigratable Legacy Code

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
