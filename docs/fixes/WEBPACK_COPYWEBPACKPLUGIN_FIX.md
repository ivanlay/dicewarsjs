# Webpack CopyWebpackPlugin Redundancy Fix

## Issue Description

The webpack configuration was unnecessarily copying entire ES6 module source directories to the dist folder during builds. This created redundancy as webpack already bundles these modules into the output files.

### Before Fix

The CopyWebpackPlugin was copying:

- `src/game-loader.js`
- `src/gameWrapper.js`
- `src/Game-browser.js`
- Entire directories: `src/mechanics`, `src/utils`, `src/models`, `src/state`, `src/ai`

This resulted in 48 unnecessary files (83.5 KiB) being copied to the dist folder.

### Root Cause

The configuration was designed to support both:

1. Modern ES6 module imports (bundled by webpack)
2. Legacy script tag imports (requiring raw source files)

However, the modern build doesn't need raw source files since webpack bundles everything.

## Solution

Updated `webpack.common.js` to only copy files that are actually needed:

### Legacy Files (Still Needed)

- `game.js` - Legacy game engine
- `main.js` - Legacy UI and game control
- `mc.js` - CreateJS graphics definitions
- `areadice.js` - Dice graphics library
- `config.js` & `config-ai-vs-ai.js` - Configuration files

### Assets (Still Needed)

- `sound/` directory - Audio files
- `*.css` files - Stylesheets

### Removed from Copy

- All ES6 module source directories
- Individual ES6 module files

## Benefits

1. **Smaller Build Size**: Reduced dist folder by ~84KB of unnecessary files
2. **Cleaner Output**: Only essential files in production build
3. **Faster Builds**: Less file I/O during build process
4. **Clearer Separation**: Legacy files vs. modern bundled code

## Verification

After the fix:

```bash
# Build output now shows:
assets by path sound/*.wav 217 KiB  # Sound files
assets by path *.js 132 KiB         # Legacy + bundled files
asset index.html 3.21 KiB           # HTML entry

# No more "assets by path src/" line showing 83.5 KiB
```

## Future Considerations

As the migration progresses and legacy files are phased out, the CopyWebpackPlugin patterns can be further reduced. Eventually, only assets (sounds, images) will need to be copied.
