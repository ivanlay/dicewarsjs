# Bridge Architecture: ES6 to Legacy Code

This document explains the bridge architecture used in DiceWarsJS to manage the transition from legacy code to modern ES6 modules.

## Overview

The bridge pattern implemented in this project allows us to:

1. Incrementally migrate to ES6 modules
2. Maintain backward compatibility with the legacy code
3. Avoid a complete rewrite while modernizing the codebase
4. Test and verify changes in isolation

## Critical Components

### 1. Game Loader (`src/game-loader.js`)

The game loader is the foundation of the bridge, responsible for:

- Initializing critical global objects before other scripts run
- Creating fallback constructors for essential game objects (Game, Battle)
- Setting up the global namespace with required objects
- Ensuring CreateJS dependencies are available
- Establishing the core event handling functions

```javascript
// Example from game-loader.js
window.Game = function() {
  this.XMAX = 28;
  this.YMAX = 32;
  this.cel_max = this.XMAX * this.YMAX;
  this.AREA_MAX = 32;
  this.pmax = 7;
  // ...
};

// Initialize global objects
window.prio = window.prio || [];
window.timer_func = window.timer_func || null;
// ...
```

### 2. Bridge Modules

The bridge consists of ES6 modules that:

1. Import functionality from modern ES6 module implementations
2. Export that functionality to the global window object for legacy code
3. Also provide proper ES6 exports for new code

```javascript
// Example: ai.js bridge
import { ai_default, ai_defensive, ai_example, ai_adaptive } from '../ai/index.js';

// Export to global scope for legacy code
window.ai_default = ai_default;
window.ai_defensive = ai_defensive;
window.ai_example = ai_example;
window.ai_adaptive = ai_adaptive;

// Also export as ES6 module for new code
export { ai_default, ai_defensive, ai_example, ai_adaptive };
```

## Bridge Components

The bridge system is composed of several modules:

1. **AI Bridge** (`src/bridge/ai.js`)

   - Exposes AI strategy functions to the global scope
   - Used by the legacy game.js for AI player moves

2. **Game Utils Bridge** (`src/bridge/gameUtils.js`)

   - Provides utility functions used throughout the game
   - Contains helper functions for dice rolling, territory management, etc.

3. **Render Bridge** (`src/bridge/render.js`)

   - Exposes rendering functions to the global scope
   - Handles drawing game elements

4. **Sound Bridge** (`src/bridge/sound.js`)
   - Provides sound handling functionality
   - Manages game audio effects

## Initialization Sequence and Timing Issues

The correct initialization sequence is critical for the game to function properly:

1. CreateJS loads first (from CDN)
2. game-loader.js initializes essential global objects
3. Legacy library scripts (areadice.js, mc.js) load
4. Webpack bundles with modern code load
5. main.js initializes the game using objects from all previous scripts

### Common Problems

Legacy code might try to access bridged functions before they're initialized, causing errors like:

```
Uncaught runtime errors:
ERROR
"Game is not defined"
"prio is undefined"
"ai_function is not a function"
```

These errors typically occur because:
- Global objects are accessed before they're initialized
- Scripts are loaded in the wrong order
- ES6 module features (like export statements) in non-module context cause syntax errors
- Webpack bundling affects module execution order

### Solutions

We've implemented several strategies to handle initialization timing:

1. **Game Loader Pre-initialization**

   - The `game-loader.js` script initializes critical global objects before all other scripts
   - Provides fallback constructors and objects to prevent undefined errors
   - Uses DOMContentLoaded event to ensure proper timing

2. **Delayed Initialization**

   - Initialize key objects with null/empty values initially
   - Populate with actual functions after modules are loaded
   - Example: Game.js now initializes AI array with nulls and populates it later in start_game()

3. **Function Existence Checks**

   - Add existence checks before calling potentially uninitialized functions
   - Provide fallbacks for missing functions
   - Example: com_thinking() now checks if ai_function exists before calling it

4. **Explicit Loading Order**
   - Ensure bridge modules are loaded before they are needed
   - Control script loading order in index.html
   - Ensure proper MIME types for scripts (`type="text/javascript"`)
   - Remove defer/async attributes for critical scripts

5. **Window Namespace and Defensive Programming**
   - Use explicit window namespace for global variables
   - Add null checks before accessing properties of global objects
   - Use patterns like `window.obj = window.obj || {}`

## Best Practices for Bridge Components

When working with or adding to the bridge architecture:

1. **Always Check for Existence**

   ```javascript
   if (typeof window.myFunction === 'function') {
     // Safe to call
     window.myFunction();
   }
   ```

2. **Provide Fallbacks**

   ```javascript
   const myFunction =
     typeof window.myFunction === 'function' ? window.myFunction : defaultImplementation;
   ```

3. **Use Explicit Window Namespace**

   ```javascript
   // Avoid
   Game = function() { /* ... */ };
   
   // Prefer
   window.Game = function() { /* ... */ };
   ```

4. **Defensive Initialization**

   ```javascript
   // Initialize with empty/default values if not already defined
   window.prio = window.prio || [];
   window.timer_func = window.timer_func || null;
   ```

5. **Protect Against Null/Undefined**

   ```javascript
   // Before
   function initArea(area) {
     prio[area].cpos = game.adat[area].cpos;
   }
   
   // After
   function initArea(area) {
     if (prio && prio[area] && game && game.adat && game.adat[area]) {
       prio[area].cpos = game.adat[area].cpos;
     }
   }
   ```

6. **Log Bridge Initialization**

   ```javascript
   // At the end of bridge modules
   console.log('Bridge module X successfully initialized');
   ```

7. **Test for Race Conditions**
   - Create tests that verify bridge functions are available when needed
   - Test different initialization scenarios
   - Add console.error messages for missing dependencies

## Future Direction

The bridge architecture is a temporary solution to ease the transition to full ES6 modules. Eventually, all code will be migrated to ES6 modules and the bridge components will be removed.

Long-term steps:

1. Migrate all legacy code to ES6 modules
2. Ensure all code imports the ES6 modules directly
3. Remove global exports from bridge modules
4. Eventually remove bridge modules entirely

## Recent Fixes and Implementations

### Game Constructor and prio Array Undefined Errors

We recently fixed initialization issues related to undefined objects:

1. **Game is not defined Error**
   - **Problem**: Game constructor not available when main.js tries to create a new Game instance
   - **Solution**:
     - Added game-loader.js to preemptively define the Game constructor
     - Added fallback in main.js if Game constructor is still undefined
     - Modified bridge/Game.js to immediately expose the Game constructor to global scope
     - Used explicit window.Game references throughout the code

2. **prio is undefined Error**
   - **Problem**: The prio array was accessed before being initialized
   - **Solution**:
     - Added prio initialization in game-loader.js
     - Modified main.js to use the global prio array when it exists
     - Added null checks before accessing prio array elements
     - Used defensive initialization pattern with window.prio = window.prio || []

3. **AI Functions Not Available**
   - **Problem**: AI functions were referenced directly in the Game constructor
   - **Solution**:
     - Initialized Game.ai array with null values
     - Populated the array in the start_game method
     - Added error handling in com_thinking for graceful fallbacks

These patterns should be applied to other components as we continue the modernization process.

## Debugging Bridge Issues

When debugging bridge-related issues:

1. **Check the Browser Console**: Look for errors that indicate undefined objects or functions
2. **Inspect the Global Window Object**: Use `console.log(window.objectName)` to verify if an object is properly exposed
3. **Trace Initialization Sequence**: Add console logs throughout the initialization process to see the exact order
4. **Network Tab**: Verify that all scripts are loaded in the correct order and with the correct MIME types
5. **Check for ES6 Syntax in Non-Module Scripts**: Ensure that scripts loaded directly in HTML don't use ES6 module syntax
6. **Use Breakpoints**: Set breakpoints in key initialization functions to step through the process
