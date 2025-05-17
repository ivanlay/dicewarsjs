# Webpack Development Environment Fixes

This document consolidates fixes implemented for the DiceWarsJS development environment, specifically addressing issues with webpack configuration, asset loading, and hybrid architecture compatibility.

## Issues Fixed

### 1. Webpack Development Server Configuration

**Problem:**

- 404 errors for bundle files:
  ```
  GET http://localhost:3000/runtime.bundle.js [HTTP/1.1 404 Not Found]
  GET http://localhost:3000/vendors.bundle.js [HTTP/1.1 404 Not Found]
  GET http://localhost:3000/main.bundle.js [HTTP/1.1 404 Not Found]
  ```
- The `serve` script was using the serve package instead of webpack-dev-server

**Solution:**

- Updated package.json scripts to use webpack-dev-server consistently:
  ```json
  "scripts": {
    "dev": "webpack serve --mode development",
    "serve": "webpack serve --mode development", // Changed from "serve dist -p 3000"
    "build": "webpack --mode production",
    ...
  }
  ```
- Improved webpack configuration for consistent chunk naming between development and production:
  ```javascript
  config.optimization = {
    runtimeChunk: 'single', // Use 'single' instead of naming it for consistency
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          enforce: true, // Force creation of this chunk
        },
      },
    },
  };
  ```

### 2. Game-Loader.js Not Being Copied to Dist

**Problem:**

- 404 error for game-loader.js:
  ```
  GET http://localhost:3000/game-loader.js [HTTP/1.1 404 Not Found]
  ```
- MIME type mismatch error:
  ```
  The resource from "http://localhost:3000/game-loader.js" was blocked due to MIME type ("text/html") mismatch (X-Content-Type-Options: nosniff).
  ```

**Solution:**

- Updated the webpack configs to include game-loader.js in the CopyWebpackPlugin patterns:
  ```javascript
  new CopyWebpackPlugin({
    patterns: [
      // Copy all the legacy JS files
      { from: '*.js', to: '[name][ext]', globOptions: { ignore: ['webpack.config.js', 'webpack.*.js'] } },
      // Copy CSS files if any
      { from: '*.css', to: '[name][ext]', noErrorOnMissing: true },
      // Copy sound files for legacy code
      { from: 'sound', to: 'sound' },
      // Copy game-loader.js from src directory
      { from: 'src/game-loader.js', to: 'game-loader.js' },
    ],
  }),
  ```

### 3. Sound Loading Failures

**Problem:**

- Multiple "Type not recognized" errors during sound loading:
  ```
  Failed to load sound: snd_click Error: Type not recognized.
  Failed to load sound: snd_button Error: Type not recognized.
  Failed to load sound: snd_dice Error: Type not recognized.
  ```
- Dynamic imports were causing MIME type detection issues

**Solution:**

- Changed sound loading from dynamic imports to direct file paths:

  ```javascript
  // Changed from dynamic imports
  const soundFiles = {
    snd_button: './sound/button.wav',
    snd_clear: './sound/clear.wav',
    snd_click: './sound/click.wav',
    // ...other sounds
  };
  ```

- Added explicit file type to sound registration:

  ```javascript
  // Use registerSound with explicit type to avoid MIME issues
  const result = createjs.Sound.registerSound({
    src: soundPath,
    id: soundId,
    type: 'wav', // Explicitly set the file type to avoid MIME detection issues
  });
  ```

- Enhanced sound system initialization:

  ```javascript
  // Configure CreateJS to use HTML5 audio
  if (createjs.Sound.activePlugin?.capabilities) {
    // Explicitly set preferred MIME types and extensions
    createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);
  }

  // Pre-load the manifest with explicit types
  for (const [soundId, soundPath] of Object.entries(soundFiles)) {
    SOUND_MANIFEST.push({
      id: soundId,
      src: soundPath,
      type: 'wav',
    });
  }
  ```

### 4. AI vs AI Mode Configuration

**Problem:**

- "AI function not found for player 0" error in AI vs AI (spectator) mode
- Inconsistent configuration between global config.js and ES6 module config.js

**Solution:**

- Updated game-loader.js with helper function for AI lookup:

  ```javascript
  // Make the AI registry accessible by string keys
  window.getAIFunctionByName = function (aiName) {
    if (!aiName || typeof aiName !== 'string') return window.ai_default;

    const aiFunction = window.AI_REGISTRY[aiName];
    if (typeof aiFunction === 'function') return aiFunction;

    console.warn(`AI type ${aiName} not found, using default AI`);
    return window.ai_default;
  };
  ```

- Enhanced com_thinking function in game.js:

  ```javascript
  this.com_thinking = function () {
    // Get the current player number
    var currentPlayer = this.jun[this.ban];

    // Look up the AI function for the current player
    var ai_function = this.ai[currentPlayer];

    // If player 0 is configured as AI (humanPlayerIndex is null), use the aiTypes
    // configuration to determine which AI function to use
    if (currentPlayer === 0 && window.GAME_CONFIG && window.GAME_CONFIG.humanPlayerIndex === null) {
      var aiType = window.GAME_CONFIG.aiTypes && window.GAME_CONFIG.aiTypes[currentPlayer];
      if (aiType && typeof window.getAIFunctionByName === 'function') {
        console.log('Using AI for player 0: ' + aiType);
        ai_function = window.getAIFunctionByName(aiType);
      }
    }

    // Rest of the function...
  };
  ```

- Updated both config files for consistent AI configuration:

  ```javascript
  // In config.js (legacy)
  window.GAME_CONFIG = {
    // Game rules
    playerCount: 7,
    humanPlayerIndex: 0, // Set to null for AI vs AI
    averageDicePerArea: 3,
    maxDice: 8,

    // AI configuration
    aiTypes: [
      'ai_adaptive', // Player 0 (human by default, AI in spectator mode)
      'ai_example', // Player 1
      'ai_defensive', // Player 2
      'ai_adaptive', // Player 3
      // ...other players
    ],

    // Spectator mode settings
    spectatorSpeedMultiplier: 2,
  };

  // Similar updates in src/utils/config.js (modern)
  ```

## AudioContext Initialization

The AudioContext initialization was already properly implemented but was generating warnings in modern browsers. The solution is already in place:

```javascript
// Add click handler to initialize AudioContext on user gesture
document.addEventListener('click', function initAudioContext() {
  if (
    createjs &&
    createjs.Sound &&
    createjs.Sound.context &&
    createjs.Sound.context.state !== 'running'
  ) {
    createjs.Sound.context.resume().then(() => {
      console.log('AudioContext started on user gesture');
    });
  }
  // Only remove the listener once we've successfully started the context
  if (
    createjs &&
    createjs.Sound &&
    createjs.Sound.context &&
    createjs.Sound.context.state === 'running'
  ) {
    document.removeEventListener('click', initAudioContext);
  }
});
```

## Testing and Verification

The changes were verified by:

1. Running `npm run serve` and confirming no 404 errors
2. Checking that bundle files are correctly generated
3. Confirming game-loader.js loads correctly without MIME type errors
4. Verifying that sound files load and play without "Type not recognized" errors
5. Confirming the game loads and runs properly in both normal and AI vs AI modes
6. Testing AI functionality in spectator mode with player 0 using an AI function
