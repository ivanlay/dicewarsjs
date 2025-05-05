# Webpack Configuration Fixes

## Issue Summary

When running webpack in development mode, we encountered an error:

```
Error: Conflict: Multiple chunks emit assets to the same filename bundle.js (chunks main and runtime~main)
```

This issue occurred because the webpack configuration had inconsistent settings between development and production modes, specifically with how chunks were named and how the runtime chunk was configured.

## Changes Made

1. **Fixed output filenames**

   - Changed output filename in development mode from `bundle.js` to `[name].bundle.js`
   - This ensures each chunk gets a unique filename based on its name

2. **Consolidated chunking configuration**

   - Moved common chunking configuration to be shared between dev and prod modes
   - Consistent use of `runtimeChunk: 'single'` in both environments
   - Standardized chunk naming across environments

3. **Updated HTML references**

   - Fixed script tags in index.html and debug.html
   - Now properly loading runtime, main bundle, and sound assets bundle
   - Added conditional loading of vendors.bundle.js which is only present in dev server mode

4. **Added build:dev command**

   - Created a dedicated npm script for development builds
   - Helped with testing bundle configuration

5. **Debug tools**
   - Created debug.html for troubleshooting
   - Added healthcheck.js for verifying build output

## Root Causes

1. **Inconsistent configuration**: The development and production configurations had different chunking strategies, causing naming conflicts.

2. **Missing dependencies in HTML**: The HTML files weren't properly referencing all required chunks.

3. **Runtime chunk naming**: The runtime chunk wasn't properly named, causing conflicts with the main bundle.

## How to Avoid This Issue

1. **Use consistent chunk naming**: Always use a naming pattern like `[name].bundle.js` in development and `[name].[contenthash].js` in production.

2. **Consolidate common configuration**: Keep shared configuration outside of mode-specific sections.

3. **Verify bundle references**: Ensure HTML files reference all required chunks in the correct order.

4. **Use the healthcheck script**: Run `node healthcheck.js` after builds to verify all required files are present.

## Testing

After making these changes:

1. Development server starts successfully
2. All required bundles are generated properly
3. The healthcheck script confirms a valid build
4. Both index.html and debug.html load all required scripts

## References

- [Webpack Configuration Documentation](https://webpack.js.org/configuration/)
- [Webpack Code Splitting Guide](https://webpack.js.org/guides/code-splitting/)
- [RuntimeChunk Documentation](https://webpack.js.org/configuration/optimization/#optimizationruntimechunk)
