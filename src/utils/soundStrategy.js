/**
 * Sound Strategy Module
 *
 * Provides strategic loading of sound assets based on priority and usage patterns.
 * Implements lazy loading, prioritization, and load management.
 */

/*
 * Sound priority categories
 * Sounds grouped by when they're most likely needed during gameplay
 */
export const SOUND_PRIORITIES = {
  // Critical sounds needed immediately on startup
  CRITICAL: ['snd_button', 'snd_click'],

  // Gameplay sounds needed during regular play
  GAMEPLAY: ['snd_dice', 'snd_success', 'snd_fail', 'snd_myturn'],

  // End game sounds only needed at game conclusion
  ENDGAME: ['snd_clear', 'snd_over'],
};

// Loading states tracking
let loadingCount = 0;
const loadListeners = new Set();

/**
 * Register a listener for sound loading state changes
 * @param {Function} callback - Function to call when loading state changes
 * @returns {Function} Function to remove this listener
 */
export function addLoadListener(callback) {
  loadListeners.add(callback);
  return () => loadListeners.delete(callback);
}

/**
 * Update loading status and notify listeners
 * @param {number} delta - Change to loading count (1 for start, -1 for complete)
 */
export function updateLoadStatus(delta) {
  loadingCount += delta;
  loadListeners.forEach(listener => listener(loadingCount > 0));
}

/**
 * Check if browser supports requestIdleCallback for optimized loading
 */
const hasIdleCallback = typeof window !== 'undefined' && 'requestIdleCallback' in window;

/**
 * Schedule a task to run when browser is idle
 * @param {Function} callback - Function to call
 * @param {Object} [options] - Options for requestIdleCallback
 */
export function scheduleWhenIdle(callback, options = { timeout: 2000 }) {
  if (hasIdleCallback) {
    window.requestIdleCallback(callback, options);
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(callback, 1000);
  }
}

/**
 * Load sounds based on their priority category
 * @param {Function} loadSoundFn - Function to load a sound by ID
 */
export function loadSoundsByPriority(loadSoundFn) {
  if (!loadSoundFn || typeof loadSoundFn !== 'function') {
    console.error('loadSoundsByPriority requires a sound loading function');
    return;
  }

  // Load critical sounds immediately
  SOUND_PRIORITIES.CRITICAL.forEach(soundId => {
    loadSoundFn(soundId);
  });

  // Load gameplay sounds after a short delay
  setTimeout(() => {
    SOUND_PRIORITIES.GAMEPLAY.forEach(soundId => {
      loadSoundFn(soundId);
    });
  }, 1000);

  // Load end game sounds when idle
  scheduleWhenIdle(() => {
    SOUND_PRIORITIES.ENDGAME.forEach(soundId => {
      loadSoundFn(soundId);
    });
  });
}

/**
 * Create a loading indicator for sound assets
 * @param {HTMLElement} container - Container element to add loading indicator to
 * @returns {Object} Functions to manipulate the loading indicator
 */
export function createLoadingIndicator(container) {
  // Create loading indicator element
  const indicator = document.createElement('div');
  indicator.className = 'sound-loading-indicator';
  indicator.style.display = 'none';
  indicator.innerHTML = 'Loading sounds...';

  // Style the indicator
  Object.assign(indicator.style, {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '3px',
    fontSize: '12px',
    zIndex: '1000',
  });

  // Add to container
  container.appendChild(indicator);

  // Set up loading listener
  const removeListener = addLoadListener(isLoading => {
    indicator.style.display = isLoading ? 'block' : 'none';
  });

  return {
    // Remove the indicator
    remove: () => {
      container.removeChild(indicator);
      removeListener();
    },
    // Update indicator text
    updateText: text => {
      indicator.innerHTML = text;
    },
  };
}

export default {
  loadSoundsByPriority,
  SOUND_PRIORITIES,
  addLoadListener,
  createLoadingIndicator,
  scheduleWhenIdle,
};
