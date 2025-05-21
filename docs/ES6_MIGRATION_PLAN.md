# ES6 Migration Plan for DiceWarsJS

This document provides a detailed plan for completing the migration of DiceWarsJS from legacy JavaScript to modern ES6 modules.

## Background

DiceWarsJS currently uses a hybrid architecture with:

1. **Legacy Code**: Original implementation with global variables/functions in the root directory
2. **Modern ES6 Modules**: Structured code with proper imports/exports in the src/ directory
3. **Bridge Pattern**: Connects legacy code with ES6 modules by exposing modern functionality to the global scope

The bridge pattern has allowed for incremental modernization, but the final goal is to complete the migration to a fully modular ES6 codebase.

## Migration Strategy Overview

The migration will follow a phased approach to ensure the game remains functional throughout the process:

1. Assess and plan the migration
2. Establish robust testing infrastructure
3. Migrate core components to ES6 modules
4. Modernize UI and interaction systems
5. Optimize performance and error handling
6. Reduce bridge dependencies
7. Handle unmigrateable code
8. Document and clean up code
9. Remove bridge components entirely

## Detailed Phase Breakdown

### Phase 1: Assessment and Planning (1-2 weeks)

#### Tasks:

1. **Complete Code Audit**

   - Create an inventory of all global variables and functions
   - Map dependencies between legacy and modern code
   - Document current bridge component usage
   - Create a dependency graph to visualize relationships

2. **Establish Migration Priorities**

   - Prioritize components based on:
     - Complexity (start with simpler components)
     - Dependencies (start with least dependent modules)
     - Strategic value (focus on core game logic)
   - Create a detailed migration schedule with milestones

3. **Define Success Criteria**
   - Establish measurable goals for each migration phase
   - Create performance benchmarks
   - Define testing requirements
   - Establish quality gates for each component

#### Deliverables:

- Complete dependency graph
- Migration schedule with priorities
- Success criteria document
- Risk assessment and mitigation plan

### Audit Findings

The initial code audit produced an inventory of legacy scripts and how they
interact with the modern ES6 modules:

- **index.html** loads several legacy scripts before webpack injects the module
  bundles.
- **game-loader.js** defines placeholder AI functions and exposes them globally
  via `AI_REGISTRY`.
- **game.js**, **main.js**, **mc.js**, **areadice.js**, and the `ai_*.js` files
  still declare many global variables and functions.
- Bridge modules under `src/bridge/` make the new ES6 classes available in the
  global scope.
- ES6 counterparts for these components live in `src/`, including the modern
  `Game` class in `src/Game.js`.

This inventory will guide the remaining migration effort by showing exactly
which legacy files still need to be replaced or refactored.

A key part of this ongoing audit is to determine the full migratability of `game.js` and `main.js`. While `src/Game.js` is the modern ES6 replacement for `game.js`, the extent to which all functionalities from the legacy `game.js` and `main.js` can be migrated versus needing an adapter layer will be continuously assessed.

### Phase 2: Infrastructure and Environment Setup (1-2 weeks)

#### Tasks:

1. **Enhance Testing Infrastructure**

   - Create unit tests for bridge components
   - Implement integration tests for bridge-to-legacy interaction
   - Set up automated regression tests
   - Establish test coverage goals

2. **Refine Build Pipeline**

   - Optimize webpack configuration
   - Set up distinct development and production builds
   - Split webpack config into `webpack.common.js`, `webpack.legacy.js` and `webpack.modern.js`
   - Implement proper source maps (generated in development and production)
   - Add bundle size analysis
   - Establish performance monitoring

Bundle analysis can be generated with `npm run build:analyze`. A helper script `npm run perf:check` verifies that the total bundle size remains under 250KB.

3. **Create Migration Utilities**

   - Develop helper functions for common migration patterns
   - Create tools to verify global scope pollution
   - Build compatibility wrappers

4. **Optimize Asset Handling in Build Process**:
   Review the usage of `CopyWebpackPlugin` in `webpack.common.js`. For modern builds, prioritize bundling of `src` files over direct copying. If direct copying is maintained for legacy compatibility, ensure this is documented and minimized for modern ES module outputs.

**Specific areas of concern**:

The `CopyWebpackPlugin` configuration currently copies several directories from `src/` (e.g., `src/mechanics`, `src/utils`, `src/models`, `src/state`, `src/ai`) and individual files like `src/Game-browser.js` and `src/gameWrapper.js` into the distribution folder.

**Recommendations for Modern Build (`webpack.modern.js`)**:

- **Investigate Necessity**: Determine if these copied `src/` directories and files are actively used as loose files in the modern build or if they are redundant due to Webpack's bundling of ES6 imports starting from `src/index.js`.
- **Prioritize Bundling**: For the modern ES6 build, the primary mechanism for including code from `src/` subdirectories should be through ES6 `import` statements that Webpack resolves and bundles. This allows for tree-shaking and optimized chunk generation.
- **Reduce Redundancy**: Aim to remove `CopyWebpackPlugin` patterns for `src/` subdirectories in the modern build configuration if they are indeed bundled effectively. This might involve:
  - Ensuring all internal imports use resolvable paths (aliases or relative paths).
  - Verifying that no part of the modern application attempts to fetch these as separate files.
- Files like `src/game-loader.js`, `src/Game-browser.js`, or `src/gameWrapper.js` might be exceptions if they serve specific roles as separate scripts even in a modern context, but this should be confirmed.

**Recommendations for Legacy Build (`webpack.legacy.js`)**:

- **Document Dependencies**: If the legacy scripts (e.g., root `game.js`, `main.js`) rely on these copied `src/` files being present at specific paths, this dependency should be clearly documented.
- **Long-Term Elimination**: The ongoing ES6 migration should gradually eliminate the need for these copied raw `src` files, even for the legacy context, as legacy scripts are refactored or replaced by modules that correctly import bundled code.

**Action Item**:

- A developer should review the `CopyWebpackPlugin` setup. Start by trying to remove the concerning copy patterns for a modern build locally and test if the application still works correctly. This will help identify if these copies are truly redundant or if there are hidden dependencies. Document findings and adjust the build process accordingly.

#### Deliverables:

- Comprehensive test suite
- Optimized build configuration
- Developer tooling for migration
- Documentation for the new infrastructure

### Phase 3: Core Components Migration (2-3 weeks)

#### Tasks:

1. **Complete Game State Management**

   - Finish immutable state patterns implementation
   - Add proper undo/redo functionality
   - Implement event system for state changes
   - Create proper game state serialization
   - Ensure all data structures previously defined globally in `game.js` (like `AreaData`, `PlayerData`, etc.) are fully replaced by their ES6 module counterparts imported via `@models/index.js`.

2. **Migrate Map Generation and Battle Resolution**

   - Fully migrate map generation logic from legacy `game.js` (including `make_map`, `percolate`, `set_area_line`) to ES6 modules under `src/mechanics/` (e.g., `mapGenerator.js`). Ensure functional parity and use of ES6 best practices.

- Implement TypedArray-based grid representation (verify relevance, current implementation uses standard arrays).
- Create proper battle history tracking.
- Fully migrate territory connectivity logic (`set_area_tc`) from legacy `game.js` to an appropriate ES6 module in `src/mechanics/`, ensuring functional parity.
- Optimize territory connectivity algorithms (this sub-point can be kept if distinct from the migration of `set_area_tc`).

3. **Migrate Event System**

   - Create ES6 event system
   - Implement pub/sub pattern
   - Create bridge for legacy event handling
   - Add event debugging capabilities

4. **Finalize AI System Migration**

   - Ensure the AI handling mechanisms in `src/Game.js` (using `executeAIMove` from `aiHandler.js` and the `aiRegistry`) fully replace and provide parity with the legacy `com_thinking` function and AI initialization logic found in `game.js`. This includes ensuring robust error handling or fallback behavior if an AI function is not correctly configured for a player, similar to the legacy system's checks.
   - Decommission reliance on globally defined AI functions (`window.ai_...`). This will involve removing the parts of `src/bridge/ai.js` that export AI functions to the `window` object, once no legacy component (primarily `game.js`) relies on these global references. The `AI_REGISTRY` in `src/ai/index.js` should become the sole source of truth for AI function mapping.
   - Consolidate AI configuration management through `src/utils/config.js` and the `Game` instance's `applyConfig` method, phasing out any AI-related settings from the root `config.js` if they are redundant.

5. **Assess and Migrate Legacy `main.js` Logic**
   - Audit the root `main.js` to identify remaining legacy patterns, direct DOM manipulations, and dependencies on global state or functions from the old `game.js`.
   - Plan and execute the migration of `main.js` functionalities to ES6 modules, potentially within `src/ui/`, `src/index.js` (for application entry point logic), or new specific modules.
   - Focus on modernizing UI interaction, event handling, and game setup orchestration.

#### Deliverables:

- Fully modular game state management
- ES6-based map generation and battle systems
- Modern event system architecture
- Updated tests for core components

### Phase 4: UI and Interaction Migration (1-2 weeks)

#### Tasks:

1. **Modernize Rendering Pipeline**

   - Convert global render functions to module-based
   - Implement canvas abstraction layer
   - Separate render logic from game state
   - Create proper rendering optimization

2. **Update Input Handling**

   - Replace direct DOM event handlers
   - Create input manager module
   - Implement proper touch controls
   - Add accessibility features

3. **Refactor UI Components**
   - Convert hardcoded UI to component-based approach
   - Implement UI state management
   - Create screen manager
   - Add responsive design improvements

#### Deliverables:

- Modular rendering system
- Modern input handling
- Component-based UI architecture
- Improved user experience

### Phase 5: Error Handling and Optimization (1-2 weeks)

#### Tasks:

1. **Implement Error Boundaries**

   - Create proper error handling system
   - Add graceful degradation
   - Implement logging and reporting
   - Add defensive programming patterns

2. **Performance Optimization**

   - Apply TypedArrays for critical operations
   - Implement Map and Set data structures
   - Optimize rendering loop
   - Reduce memory footprint

3. **Memory Management**
   - Fix memory leaks
   - Implement proper resource cleanup
   - Add performance monitoring
   - Optimize asset loading

#### Deliverables:

- Robust error handling system
- Performance optimization documentation
- Memory usage report
- Benchmark results comparison

### Phase 6: Bridge Reduction (1-2 weeks)

#### Tasks:

1. **Identify Safe Bridge Removals**

   - Analyze bridge component usage
   - Create a list of safe removals
   - Document impact and risks
   - Establish removal sequence

2. **Implement Direct Module References**

   - Replace bridge imports with direct module imports
   - Update code to use ES6 exports directly
   - Test each replacement thoroughly
   - Document the transition

3. **Clean Up Global Namespace**
   - Gradually remove global variables
   - Test for window object pollution
   - Implement strict mode
   - Verify no regression issues

#### Deliverables:

- Bridge reduction progress report
- Updated dependency graph
- Global namespace analysis
- Test coverage report

### Phase 7: Strategy for Difficult-to-Migrate Code (1 week)

#### Tasks:

1. **Identify Boundaries for Difficult-to-Migrate Code**

   - Document components that are deemed too complex, high-risk, or low-benefit to fully rewrite into ES6 modules. Prime examples include parts of `game.js` and `main.js`, and particularly the Flash-generated `mc.js` which will be handled via an adapter.
   - Create stable interfaces for these components.
   - Establish boundary enforcement methods.
   - Define interface contracts.

2. **Create Legacy Adapters**

   A key adapter, `src/adapters/MCAdapter.js`, has been created to interface with the Flash-generated `mc.js` (which likely exposes `window.MC`). This adapter is the designated ES6-compliant interface for all interactions with `mc.js`.

   - **Audit codebase for `mc.js` interactions**: Conduct a thorough search of the entire codebase (especially legacy files like `main.js`, `game.js`, and any rendering-specific scripts) to identify all direct usages of `window.MC` or its associated functions.
   - **Expand `MCAdapter.js`**: Based on the audit, extend `src/adapters/MCAdapter.js` by adding methods corresponding to all identified `mc.js` functionalities that the application requires. The existing `drawElement` and `addEventListener` methods serve as templates.
   - **Refactor existing code**: Systematically refactor all parts of the codebase that directly interact with `window.MC` to instead import and use the `MCAdapter`.
   - **Enforce Adapter Usage**: Ensure all new code requiring `mc.js` functionality uses the `MCAdapter` exclusively.
   - Develop further wrapper classes for other identified difficult-to-migrate code, ensuring they expose a modern ES6 interface.
   - Implement proxy objects where appropriate to bridge legacy patterns with modern ones.
   - Document usage patterns for all adapters.
   - Test adapter effectiveness in isolating legacy behavior and providing a clean interface.

3. **Isolate Legacy Dependencies**
   - Minimize dependencies on any code not migrated to ES6 modules. The `MCAdapter.js` serves as a prime example of isolating the dependencies on the legacy `mc.js` file.
   - Create clear boundaries between modern ES6 code and any remaining legacy code or adapters.
   - Use dependency injection where possible to provide modern components to legacy code, rather than relying on global access.
   - Document all integration points with legacy systems or adapters.

#### Deliverables:

- Legacy code inventory
- Adapter implementation documentation
- Integration testing report
- Future maintenance guide

### Phase 8: Documentation and Cleanup (1 week)

#### Tasks:

1. **Update Development Documentation**

   - Create detailed architecture documents
   - Update API references
   - Provide migration notes
   - Create developer onboarding guide

2. **Code Cleanup**

   - Remove dead code
   - Standardize naming conventions
   - Apply consistent formatting
   - Update comments

3. **Final Testing and Validation**
   - Comprehensive testing
   - Verify browser compatibility
   - Performance benchmarking
   - User acceptance testing

#### Deliverables:

- Comprehensive documentation
- Clean, standardized codebase
- Test coverage report
- Performance benchmark results

### Phase 9: Final Bridge Removal (1 week)

#### Tasks:

1. **Remove Bridge Components**

   - Remove bridge modules after all dependencies are migrated
   - Update any remaining references
   - Verify no global window pollution
   - Confirm all imports use direct ES6 modules

2. **Update Entry Points**

   - Update HTML to use bundled module
   - Remove legacy script loading
   - Finalize webpack configuration using the new split setup
   - Optimize loading sequence

3. **Final Verification**
   - Complete end-to-end testing
   - Verify all features work without bridge
   - Performance comparison with legacy version
   - Cross-browser compatibility testing

#### Deliverables:

- Pure ES6 module codebase
- Updated bundle configuration
- Final test report
- Project completion documentation

## Implementation Timeline

**Total estimated time**: 8-12 weeks, depending on codebase complexity and available resources

- **Phase 1-2**: 1-2 weeks
- **Phase 3-4**: 3-4 weeks
- **Phase 5-6**: 2-3 weeks
- **Phase 7-8**: 1-2 weeks
- **Phase 9**: 1 week

## Success Metrics

The migration will be considered successful when:

1. **Zero global variables** exist except those absolutely required or those isolated behind well-defined adapter modules for difficult-to-migrate legacy code.
2. **100% ES6 module coverage** for all new and refactored code. Difficult-to-migrate legacy code will be interfaced through ES6 adapter modules.
3. **Improved bundle size** and loading performance
4. **Complete test coverage** for all migrated components
5. **Identical game behavior** before and after migration
6. **Simplified dependency graph** with clear module boundaries

## Handling Special Cases

### Flash-Generated Code (mc.js)

Some files in the codebase (like mc.js) may never be fully migrateable to ES6 modules since they were originally generated from Adobe Flash. For these cases:

```javascript
// Example adapter for legacy Flash-generated code
export class LegacyAdapter {
  constructor() {
    // Ensure legacy code is available globally
    if (!window.legacyComponent) {
      throw new Error('Legacy component not initialized');
    }
    this.legacy = window.legacyComponent;
  }

  // Modern ES6 methods that wrap legacy functionality
  modernMethod(params) {
    // Call legacy methods with appropriate parameters
    return this.legacy.legacyMethod(params);
  }
}
```

### Initialization Timing

For components with complex initialization timing requirements:

```javascript
// Deferred initialization pattern
export class DeferredComponent {
  constructor() {
    this._initialized = false;
    this._pendingCalls = [];
  }

  initialize() {
    // Initialization logic
    this._initialized = true;

    // Process any pending calls
    this._pendingCalls.forEach(({ method, args }) => {
      this[method](...args);
    });
    this._pendingCalls = [];
  }

  methodCall(...args) {
    if (!this._initialized) {
      // Store call for later execution
      this._pendingCalls.push({ method: 'methodCall', args });
      return;
    }

    // Normal execution
    // Implementation...
  }
}
```

## References

- [Bridge Architecture](./BRIDGE_ARCHITECTURE.md)
- [Project Roadmap](./ROADMAP.md)
- [ES6 Improvements](./es6-improvements/)
  - [Immutable Patterns](./es6-improvements/immutable-patterns.md)
  - [Map Data Structures](./es6-improvements/map-data-structures.md)
  - [Private Fields](./es6-improvements/private-fields.md)
  - [Territory Connectivity](./es6-improvements/territory-connectivity.md)
  - [Typed Arrays](./es6-improvements/typed-arrays.md)
