/**
 * Sound Strategy Module
 *
 * Provides strategic loading of sound assets:
 * - Prioritizes sounds by when needed (critical, gameplay, endgame)
 * - Implements lazy loading functionality
 * - Tracks loading state with listener support
 * - Uses browser idle time for non-critical assets
 * - Provides visual loading indicator
 */

// Sound priorities - load in this order
const SOUND_PRIORITIES = {
  // Critical sounds needed at startup
  CRITICAL: [
    'snd_button',
    'snd_click'
  ],
  // Gameplay sounds needed during play
  GAMEPLAY: [
    'snd_dice',
    'snd_fail',
    'snd_success',
    'snd_myturn'
  ],
  // End-game sounds that can be loaded last
  ENDGAME: [
    'snd_clear',
    'snd_over'
  ]
};

// Loading state tracking
let soundsLoading = 0;
const loadListeners = [];

/**
 * Update the sound loading status counter
 * @param {number} delta - Change to loading counter (1 for start, -1 for complete)
 */
export function updateLoadStatus(delta) {
  soundsLoading += delta;
  
  // Notify listeners
  loadListeners.forEach(listener => listener(soundsLoading));
  
  // Update visual indicator if available
  updateLoadingIndicator(soundsLoading > 0);
}

/**
 * Add a loading state change listener
 * @param {Function} listener - Callback function(loadingCount)
 * @returns {Function} Function to remove the listener
 */
export function addLoadListener(listener) {
  loadListeners.push(listener);
  
  // Return remove function
  return () => {
    const index = loadListeners.indexOf(listener);
    if (index >= 0) {
      loadListeners.splice(index, 1);
    }
  };
}

/**
 * Get current loading state
 * @returns {boolean} True if any sounds are currently loading
 */
export function isLoading() {
  return soundsLoading > 0;
}

/**
 * Load sounds in priority order
 * @param {Function} loadFunction - Sound loading function
 */
export function loadSoundsByPriority(loadFunction) {
  if (typeof loadFunction !== 'function') {
    console.error('Invalid load function provided to loadSoundsByPriority');
    return;
  }

  // Start with critical sounds
  SOUND_PRIORITIES.CRITICAL.forEach(soundId => {
    loadFunction(soundId).catch(err => 
      console.warn(`Failed to load critical sound: ${soundId}`, err)
    );
  });

  // Load gameplay sounds with slight delay
  setTimeout(() => {
    SOUND_PRIORITIES.GAMEPLAY.forEach(soundId => {
      loadFunction(soundId).catch(err => 
        console.warn(`Failed to load gameplay sound: ${soundId}`, err)
      );
    });
  }, 500);

  // Load endgame sounds when browser is idle
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(
      () => {
        SOUND_PRIORITIES.ENDGAME.forEach(soundId => {
          loadFunction(soundId).catch(err => 
            console.warn(`Failed to load endgame sound: ${soundId}`, err)
          );
        });
      },
      { timeout: 5000 }
    );
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      SOUND_PRIORITIES.ENDGAME.forEach(soundId => {
        loadFunction(soundId).catch(err => 
          console.warn(`Failed to load endgame sound: ${soundId}`, err)
        );
      });
    }, 2000);
  }
}

/**
 * Update the visual loading indicator
 * @param {boolean} isLoading - Whether sounds are loading
 */
function updateLoadingIndicator(isLoading) {
  // Check if we're in a browser environment
  if (typeof document === 'undefined') return;
  
  let indicator = document.querySelector('.sound-loading-indicator');
  
  // Create indicator if it doesn't exist
  if (isLoading && !indicator) {
    indicator = document.createElement('div');
    indicator.className = 'sound-loading-indicator';
    indicator.innerText = 'Loading sounds...';
    document.body.appendChild(indicator);
    return;
  }
  
  // Update existing indicator
  if (indicator) {
    if (isLoading) {
      indicator.style.display = 'block';
    } else {
      // Remove after a short delay to avoid flickering if loads happen in bursts
      setTimeout(() => {
        if (indicator && soundsLoading === 0) {
          indicator.remove();
        }
      }, 500);
    }
  }
}