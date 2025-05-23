/**
 * Bridge Initialization Module
 *
 * Provides a robust initialization pattern for bridge components that prevents
 * timing issues between ES6 modules and legacy code.
 */

/**
 * Promise that resolves when all bridge modules are ready
 */
let bridgeReadyPromise = null;
let bridgeReadyResolve = null;
let bridgeInitialized = false;

// Create the main promise that external code can await
bridgeReadyPromise = new Promise(resolve => {
  bridgeReadyResolve = resolve;
});

/**
 * Track initialization status of individual modules
 */
const moduleInitStatus = {
  ai: { initialized: false, error: null },
  game: { initialized: false, error: null },
  mechanics: { initialized: false, error: null },
  config: { initialized: false, error: null },
};

/**
 * Module initialization callbacks - modules call these when ready
 */
export const initCallbacks = {
  /**
   * Called when AI module is fully initialized
   */
  aiReady: (error = null) => {
    moduleInitStatus.ai.initialized = !error;
    moduleInitStatus.ai.error = error;
    checkAllModulesReady();
  },

  /**
   * Called when Game module is fully initialized
   */
  gameReady: (error = null) => {
    moduleInitStatus.game.initialized = !error;
    moduleInitStatus.game.error = error;
    checkAllModulesReady();
  },

  /**
   * Called when Mechanics module is fully initialized
   */
  mechanicsReady: (error = null) => {
    moduleInitStatus.mechanics.initialized = !error;
    moduleInitStatus.mechanics.error = error;
    checkAllModulesReady();
  },

  /**
   * Called when Config module is fully initialized
   */
  configReady: (error = null) => {
    moduleInitStatus.config.initialized = !error;
    moduleInitStatus.config.error = error;
    checkAllModulesReady();
  },
};

/**
 * Check if all modules are ready and resolve the main promise
 */
function checkAllModulesReady() {
  const allReady = Object.values(moduleInitStatus).every(status => status.initialized);
  const hasErrors = Object.values(moduleInitStatus).some(status => status.error);

  if (allReady || hasErrors) {
    bridgeInitialized = true;

    // Set global flag
    window.ES6_BRIDGE_READY = true;

    // Log status
    console.log('[Bridge Init] All modules ready:', {
      status: moduleInitStatus,
      hasErrors,
    });

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent('es6BridgeReady', {
        detail: {
          status: moduleInitStatus,
          hasErrors,
        },
      })
    );

    // Resolve the promise
    if (bridgeReadyResolve) {
      bridgeReadyResolve({
        success: !hasErrors,
        status: moduleInitStatus,
      });
    }
  }
}

/**
 * Public API for checking bridge initialization
 */
export const BridgeInitializer = {
  /**
   * Wait for all bridge modules to be ready
   * @returns {Promise} Resolves when bridge is ready
   */
  whenReady: () => bridgeReadyPromise,

  /**
   * Check if bridge is already initialized
   * @returns {boolean}
   */
  isReady: () => bridgeInitialized,

  /**
   * Get current initialization status
   * @returns {Object} Status of each module
   */
  getStatus: () => ({ ...moduleInitStatus }),

  /**
   * Force re-check of module status
   */
  recheck: () => checkAllModulesReady(),

  /**
   * Reset initialization (mainly for testing)
   */
  reset: () => {
    bridgeInitialized = false;
    window.ES6_BRIDGE_READY = false;
    Object.keys(moduleInitStatus).forEach(key => {
      moduleInitStatus[key] = { initialized: false, error: null };
    });
    bridgeReadyPromise = new Promise(resolve => {
      bridgeReadyResolve = resolve;
    });
  },
};

// Expose to global scope for legacy code
window.BridgeInitializer = BridgeInitializer;

// Add timeout to detect hanging initialization
setTimeout(() => {
  if (!bridgeInitialized) {
    console.warn('[Bridge Init] Initialization timeout - checking status');
    const uninitializedModules = Object.entries(moduleInitStatus)
      .filter(([_, status]) => !status.initialized)
      .map(([name]) => name);

    console.error('[Bridge Init] Uninitialized modules:', uninitializedModules);

    // Force completion with timeout error
    uninitializedModules.forEach(moduleName => {
      moduleInitStatus[moduleName].error = new Error('Initialization timeout');
    });

    checkAllModulesReady();
  }
}, 5000); // 5 second timeout

console.log('[Bridge Init] Initialization system ready');
