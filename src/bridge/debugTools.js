/**
 * Debug Tools Bridge Module
 *
 * Exports debugging utilities to the global scope for use in legacy code.
 * Only active in development mode to prevent performance impact in production.
 */

import * as DebugTools from '@utils/debugTools.js';

// Also export as ES6 module for new code
export * from '@utils/debugTools.js';

// Default implementations for when DebugTools is not available
const fallbacks = {
  setDebugMode: () => false,
  toggleDebugMode: () => false,
  isDebugModeEnabled: () => false,
  createDebugPanel: () => null,
  updateDebugPanel: () => {},
  removeDebugPanel: () => {},
  logPerformanceMetric: () => {},
  getAverageMetric: () => 0,
  createPerformancePanel: () => null,
  createStateInspector: () => null,
  measurePerformance: fn => fn,
  measureFPS: () => () => {},
};

// Only expose in development mode
if (process.env.NODE_ENV !== 'production') {
  try {
    // Export debug tools to global scope for legacy code
    window.DEBUG_TOOLS = DebugTools;

    // Add specific global functions
    window.toggleDebugMode = DebugTools.toggleDebugMode;
    window.createDebugPanel = DebugTools.createDebugPanel;

    // Add debug status indicator to page
    const initDebugStatusIndicator = () => {
      if (document.readyState === 'complete') {
        if (DebugTools.isDebugModeEnabled()) {
          const indicator = document.createElement('div');
          indicator.id = 'debug-mode-indicator';
          Object.assign(indicator.style, {
            position: 'fixed',
            bottom: '5px',
            left: '5px',
            backgroundColor: 'rgba(0, 100, 0, 0.7)',
            color: 'white',
            padding: '3px 6px',
            fontSize: '10px',
            fontFamily: 'monospace',
            borderRadius: '3px',
            zIndex: '10000',
            pointerEvents: 'none',
          });
          indicator.textContent = 'DEBUG MODE';
          document.body.appendChild(indicator);
        }
      } else {
        window.addEventListener('load', initDebugStatusIndicator);
      }
    };

    initDebugStatusIndicator();

    console.log('Debug tools bridge initialized in development mode');
  } catch (error) {
    console.error('Failed to initialize debug tools bridge:', error);

    // Provide fallback implementations
    window.DEBUG_TOOLS = fallbacks;
    window.toggleDebugMode = fallbacks.toggleDebugMode;
    window.createDebugPanel = fallbacks.createDebugPanel;
  }
} else {
  // In production, provide no-op implementations
  window.DEBUG_TOOLS = fallbacks;
}
