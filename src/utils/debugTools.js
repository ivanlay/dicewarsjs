/**
 * Debug Tools Module
 *
 * Provides debugging utilities to help with game development and testing.
 * Only active in development mode to prevent performance impact in production.
 */

// Track if debug mode is enabled
let debugModeEnabled = false;

// Track all registered debug panels
const debugPanels = new Map();

// Collection of performance metrics
const performanceMetrics = {
  fps: [],
  renderTime: [],
  aiDecisionTime: [],
  battleResolutionTime: [],
};

// Maximum samples to keep for rolling averages
const MAX_SAMPLES = 100;

/**
 * Enable or disable debug mode
 * @param {boolean} enabled - Whether debug mode should be enabled
 */
export function setDebugMode(enabled) {
  debugModeEnabled = enabled;
  
  // Toggle visibility of all debug panels
  debugPanels.forEach(panel => {
    panel.style.display = enabled ? 'block' : 'none';
  });
  
  // Add or remove global keyboard shortcuts
  if (enabled) {
    enableDebugShortcuts();
  } else {
    disableDebugShortcuts();
  }
  
  return debugModeEnabled;
}

/**
 * Toggle debug mode
 * @returns {boolean} New debug mode state
 */
export function toggleDebugMode() {
  return setDebugMode(!debugModeEnabled);
}

/**
 * Check if debug mode is enabled
 * @returns {boolean} True if debug mode is enabled
 */
export function isDebugModeEnabled() {
  return debugModeEnabled;
}

/**
 * Create a debug panel in the DOM
 * @param {string} id - Unique identifier for the panel
 * @param {string} title - Title to display in the panel header
 * @param {Object} [options] - Panel options
 * @param {string} [options.position='bottom-right'] - Panel position ('top-right', 'bottom-left', etc.)
 * @param {boolean} [options.collapsed=false] - Whether the panel should start collapsed
 * @param {boolean} [options.draggable=true] - Whether the panel should be draggable
 * @returns {HTMLElement} The created panel element
 */
export function createDebugPanel(id, title, options = {}) {
  if (!isDebugModeEnabled()) return null;
  
  // Default options
  const {
    position = 'bottom-right',
    collapsed = false,
    draggable = true,
  } = options;
  
  // Check if panel already exists
  if (debugPanels.has(id)) {
    return debugPanels.get(id);
  }
  
  // Create panel container
  const panel = document.createElement('div');
  panel.id = `debug-panel-${id}`;
  panel.className = `debug-panel debug-panel-${position}`;
  panel.setAttribute('data-debug-panel-id', id);
  
  // Style the panel
  Object.assign(panel.style, {
    position: 'fixed',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    border: '1px solid #444',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '12px',
    zIndex: '10000',
    width: '280px',
    display: debugModeEnabled ? 'block' : 'none',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
  });
  
  // Position the panel
  switch (position) {
    case 'top-left':
      Object.assign(panel.style, { top: '10px', left: '10px' });
      break;
    case 'top-right':
      Object.assign(panel.style, { top: '10px', right: '10px' });
      break;
    case 'bottom-left':
      Object.assign(panel.style, { bottom: '10px', left: '10px' });
      break;
    case 'bottom-right':
    default:
      Object.assign(panel.style, { bottom: '10px', right: '10px' });
      break;
  }
  
  // Create header
  const header = document.createElement('div');
  header.className = 'debug-panel-header';
  Object.assign(header.style, {
    padding: '5px 10px',
    backgroundColor: '#333',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  });
  
  // Title
  const titleEl = document.createElement('span');
  titleEl.textContent = title;
  
  // Toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = collapsed ? '+' : '-';
  toggleBtn.className = 'debug-panel-toggle';
  Object.assign(toggleBtn.style, {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '0 5px',
  });
  
  // Content container
  const content = document.createElement('div');
  content.className = 'debug-panel-content';
  Object.assign(content.style, {
    padding: '10px',
    display: collapsed ? 'none' : 'block',
  });
  
  // Assemble panel
  header.appendChild(titleEl);
  header.appendChild(toggleBtn);
  panel.appendChild(header);
  panel.appendChild(content);
  
  // Add panel to document
  document.body.appendChild(panel);
  
  // Add to tracking map
  debugPanels.set(id, panel);
  
  // Set up event handlers
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isCollapsed = content.style.display === 'none';
    content.style.display = isCollapsed ? 'block' : 'none';
    toggleBtn.textContent = isCollapsed ? '-' : '+';
  });
  
  // Make draggable if needed
  if (draggable) {
    makeElementDraggable(panel, header);
  }
  
  return panel;
}

/**
 * Make an element draggable
 * @param {HTMLElement} element - Element to make draggable
 * @param {HTMLElement} handle - Element to use as drag handle
 */
function makeElementDraggable(element, handle) {
  let offsetX = 0, offsetY = 0, isDragging = false;
  
  handle.onmousedown = dragStart;
  
  function dragStart(e) {
    e.preventDefault();
    isDragging = true;
    
    // Get initial mouse position
    offsetX = e.clientX - element.getBoundingClientRect().left;
    offsetY = e.clientY - element.getBoundingClientRect().top;
    
    // Add move and end listeners to document
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
  }
  
  function dragMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    // Calculate new position
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    // Apply new position
    element.style.left = `${x}px`;
    element.style.right = 'auto';
    element.style.top = `${y}px`;
    element.style.bottom = 'auto';
  }
  
  function dragEnd() {
    isDragging = false;
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
  }
}

/**
 * Update content in a debug panel
 * @param {string} id - Panel ID
 * @param {string|Function|HTMLElement} content - Content to display (string, function that returns content, or HTMLElement)
 */
export function updateDebugPanel(id, content) {
  if (!isDebugModeEnabled() || !debugPanels.has(id)) return;
  
  const panel = debugPanels.get(id);
  const contentEl = panel.querySelector('.debug-panel-content');
  
  if (!contentEl) return;
  
  // Handle different content types
  if (typeof content === 'function') {
    // Function that returns content
    const result = content();
    if (typeof result === 'string') {
      contentEl.innerHTML = result;
    } else if (result instanceof HTMLElement) {
      contentEl.innerHTML = '';
      contentEl.appendChild(result);
    }
  } else if (content instanceof HTMLElement) {
    // Direct HTML element
    contentEl.innerHTML = '';
    contentEl.appendChild(content);
  } else {
    // String or other content
    contentEl.innerHTML = String(content);
  }
}

/**
 * Remove a debug panel
 * @param {string} id - Panel ID to remove
 */
export function removeDebugPanel(id) {
  if (!debugPanels.has(id)) return;
  
  const panel = debugPanels.get(id);
  panel.parentNode.removeChild(panel);
  debugPanels.delete(id);
}

/**
 * Log a performance metric
 * @param {string} metricName - Name of the metric to log
 * @param {number} value - Value to log
 */
export function logPerformanceMetric(metricName, value) {
  if (!isDebugModeEnabled() || !performanceMetrics[metricName]) return;
  
  // Add value to array, keeping only the most recent samples
  performanceMetrics[metricName].push(value);
  
  // Limit array size
  if (performanceMetrics[metricName].length > MAX_SAMPLES) {
    performanceMetrics[metricName].shift();
  }
}

/**
 * Get average of a performance metric
 * @param {string} metricName - Name of the metric
 * @returns {number} Average value
 */
export function getAverageMetric(metricName) {
  if (!performanceMetrics[metricName] || performanceMetrics[metricName].length === 0) {
    return 0;
  }
  
  const sum = performanceMetrics[metricName].reduce((a, b) => a + b, 0);
  return sum / performanceMetrics[metricName].length;
}

/**
 * Create and update a performance monitoring panel
 */
export function createPerformancePanel() {
  if (!isDebugModeEnabled()) return null;
  
  const panel = createDebugPanel('performance', 'Performance Metrics', {
    position: 'top-right',
    collapsed: false,
  });
  
  // Update the panel every second
  const updateInterval = setInterval(() => {
    if (!isDebugModeEnabled()) {
      clearInterval(updateInterval);
      return;
    }
    
    const metrics = Object.entries(performanceMetrics).map(([name, values]) => {
      const avg = values.length > 0 ? 
        values.reduce((a, b) => a + b, 0) / values.length : 0;
      
      // Format based on metric type
      let formattedValue = '';
      if (name === 'fps') {
        formattedValue = `${avg.toFixed(1)} FPS`;
      } else {
        formattedValue = `${avg.toFixed(2)}ms`;
      }
      
      return `<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>${name}:</span>
        <span>${formattedValue}</span>
      </div>`;
    }).join('');
    
    updateDebugPanel('performance', `
      <div style="font-family: monospace;">
        ${metrics}
      </div>
    `);
  }, 1000);
  
  return panel;
}

/**
 * Create state inspector panel for game state
 * @param {Object} gameInstance - Game instance to inspect
 */
export function createStateInspector(gameInstance) {
  if (!isDebugModeEnabled() || !gameInstance) return null;
  
  const panel = createDebugPanel('state-inspector', 'Game State', {
    position: 'top-left',
    collapsed: true,
  });
  
  // Update the panel periodically
  const updateInterval = setInterval(() => {
    if (!isDebugModeEnabled()) {
      clearInterval(updateInterval);
      return;
    }
    
    const stateInfo = `
      <div style="font-family: monospace;">
        <div style="margin-bottom: 10px; font-weight: bold;">Current Turn: Player ${gameInstance.ban} (${gameInstance.player[gameInstance.ban]?.area_c || 0} territories)</div>
        
        <div style="margin-bottom: 10px;">
          <div style="font-weight: bold; margin-bottom: 5px;">Players:</div>
          ${Array.from({length: gameInstance.pmax}, (_, i) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span>Player ${i}:</span>
              <span>${gameInstance.player[i]?.area_c || 0} areas, ${gameInstance.player[i]?.dice_c || 0} dice</span>
            </div>
          `).join('')}
        </div>
        
        <div style="margin-bottom: 10px;">
          <div style="font-weight: bold; margin-bottom: 5px;">Last Battle:</div>
          <div>From: Area ${gameInstance.area_from}</div>
          <div>To: Area ${gameInstance.area_to}</div>
          <div>Result: ${gameInstance.defeat ? 'Success' : 'Fail'}</div>
        </div>
        
        <div>
          <div style="font-weight: bold; margin-bottom: 5px;">History:</div>
          <div>${gameInstance.his_c} actions recorded</div>
        </div>
      </div>
    `;
    
    updateDebugPanel('state-inspector', stateInfo);
  }, 500);
  
  return panel;
}

/**
 * Measure and log FPS
 * @returns {Function} Function to stop measuring
 */
export function measureFPS() {
  if (!isDebugModeEnabled()) return () => {};
  
  let frameCount = 0;
  let lastTimestamp = performance.now();
  let rafId;
  
  function countFrame() {
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastTimestamp;
    
    // Calculate FPS every second
    if (elapsed >= 1000) {
      const fps = (frameCount * 1000) / elapsed;
      logPerformanceMetric('fps', fps);
      
      // Reset counters
      frameCount = 0;
      lastTimestamp = now;
    }
    
    rafId = requestAnimationFrame(countFrame);
  }
  
  // Start measuring
  rafId = requestAnimationFrame(countFrame);
  
  // Return function to stop measuring
  return () => {
    cancelAnimationFrame(rafId);
  };
}

/**
 * Performance measuring utility for functions
 * @param {Function} fn - Function to measure
 * @param {string} metricName - Name of the metric to log
 * @returns {Function} Wrapped function that measures performance
 */
export function measurePerformance(fn, metricName) {
  if (!isDebugModeEnabled()) return fn;
  
  return function(...args) {
    const start = performance.now();
    const result = fn.apply(this, args);
    const elapsed = performance.now() - start;
    
    logPerformanceMetric(metricName, elapsed);
    
    return result;
  };
}

/**
 * Enable keyboard shortcuts for debug mode
 */
function enableDebugShortcuts() {
  // Add global keyboard handler
  window.addEventListener('keydown', handleDebugShortcuts);
}

/**
 * Disable keyboard shortcuts for debug mode
 */
function disableDebugShortcuts() {
  window.removeEventListener('keydown', handleDebugShortcuts);
}

/**
 * Handle keyboard shortcuts for debug mode
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleDebugShortcuts(e) {
  // Only listen for special key combinations
  if (!e.ctrlKey && !e.metaKey) return;
  
  // Ctrl+Shift+D = Toggle debug panel visibility
  if (e.key === 'D' && e.shiftKey) {
    e.preventDefault();
    togglePanelVisibility();
  }
  
  // Ctrl+Shift+P = Toggle performance panel
  if (e.key === 'P' && e.shiftKey) {
    e.preventDefault();
    togglePerformancePanel();
  }
}

/**
 * Toggle visibility of all debug panels
 */
function togglePanelVisibility() {
  debugPanels.forEach(panel => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });
}

/**
 * Toggle performance panel
 */
function togglePerformancePanel() {
  const panelId = 'performance';
  
  if (debugPanels.has(panelId)) {
    removeDebugPanel(panelId);
  } else {
    createPerformancePanel();
  }
}

// Initialize debug mode based on environment
if (process.env.NODE_ENV === 'development') {
  setDebugMode(true);
  
  // Expose debug tools to global scope in development mode
  if (typeof window !== 'undefined') {
    window.__DEBUG_TOOLS = {
      setDebugMode,
      toggleDebugMode,
      createDebugPanel,
      updateDebugPanel,
      removeDebugPanel,
      measurePerformance,
      createPerformancePanel,
      createStateInspector,
    };
  }
}

export default {
  setDebugMode,
  toggleDebugMode,
  isDebugModeEnabled,
  createDebugPanel,
  updateDebugPanel,
  removeDebugPanel,
  logPerformanceMetric,
  getAverageMetric,
  createPerformancePanel,
  createStateInspector,
  measurePerformance,
  measureFPS,
};