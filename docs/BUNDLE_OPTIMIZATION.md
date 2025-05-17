# Bundle Optimization Guide

This document explains how to analyze and optimize the JavaScript bundle for DiceWarsJS.

## Bundle Analysis

We've integrated the webpack-bundle-analyzer to help visualize and analyze the contents of our JavaScript bundles.

### Running Bundle Analysis

To generate a bundle report:

```bash
# Generate a static report in dist/bundle-report.html
npm run build:analyze

# Generate a report and open it in the browser automatically
npm run analyze
```

After generating the stats file, you can enforce a bundle size limit using:

```bash
npm run perf:check
```

The analyzer will create a visual representation of the bundle contents, showing:

- Each module's size (as raw, minified, and gzipped)
- How modules relate to each other
- Which modules might be candidates for optimization

## Understanding the Report

The report displays modules as rectangles with area proportional to their size.

- **Large rectangles**: These are modules that contribute significantly to bundle size and may be good candidates for optimization.
- **Groups of rectangles**: These show modules from the same package or directory.
- **Colors**: Different colors represent different types of content (scripts, styles, etc.).

## Optimization Strategies

Based on the bundle analysis, we can apply several optimization techniques:

### 1. Code Splitting

We use webpack's code splitting to break up the bundle into multiple chunks:

- **Vendor Chunk**: Third-party dependencies (e.g., CreateJS) are extracted to a separate chunk.
- **Sound Assets**: Sound files are loaded on-demand via dynamic imports.
- **Game Mechanics**: Core game mechanics are split into separate chunks.

### 2. Tree Shaking

Our webpack configuration enables tree shaking to eliminate unused code:

```javascript
optimization: {
  usedExports: true,
}
```

Ensure that modules use ES6 export/import syntax to benefit from tree shaking.

### 3. Lazy Loading

We implement lazy loading for non-critical assets and code:

```javascript
// Example of lazy loading a module
import('./mechanics/battleResolution.js').then(module => {
  // Use the module
});
```

### 4. Asset Optimization

For assets like sounds:

- Small assets (<25kb) are inlined as data URLs.
- Larger assets are loaded on-demand.
- Assets are prioritized based on when they're needed in the game.

## Best Practices

When adding new code to the project:

1. **Be Import-Aware**: Only import what you need from modules.
2. **Use Dynamic Imports**: For features not needed immediately.
3. **Prefer Modern Syntax**: Use ES6+ features that enable better optimization.
4. **Regular Analysis**: Run bundle analysis before and after significant changes.

## Improvement Opportunities

Current optimization targets:

1. **CreateJS Dependency**: Consider replacing with lighter alternatives or custom implementations.
2. **Sound Management**: Further optimize sound loading based on game state.
3. **Legacy Code**: Incrementally modernize to take advantage of tree shaking.
4. **Asset Preloading**: Optimize the priority of asset loading for better UX.

## Common Issues

### Large Bundle Size

If the bundle size increases unexpectedly:

1. Run bundle analysis to identify the cause.
2. Check for duplicate dependencies.
3. Verify that tree shaking is working for new modules.
4. Consider moving more code to dynamic imports.

### Performance Issues

If the game has performance issues despite optimization:

1. Use the built-in performance debugging tools (`process.env.NODE_ENV === 'development'`).
2. Check for memory leaks with browser tools.
3. Analyze render performance and optimize if necessary.
