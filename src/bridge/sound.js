/**
 * Sound Utilities Bridge Module
 *
 * This is a bridge module that exports ES6 module functions to the global scope
 * for compatibility with the legacy code while enabling the incremental transition to ES6.
 * Now includes lazy loading support and asset module integration.
 */

// Import ES6 module implementations
import * as SoundUtils from '../utils/sound.js';
import { loadSoundsByPriority, createLoadingIndicator } from '../utils/soundStrategy.js';

// Also export as ES6 module for new code
export * from '../utils/sound.js';

// Default sound manifest if not available in the module
const defaultSoundManifest = [
  { id: 'snd_button', src: './assets/sounds/button.wav' },
  { id: 'snd_click', src: './assets/sounds/click.wav' },
  { id: 'snd_dice', src: './assets/sounds/dice.wav' },
  { id: 'snd_success', src: './assets/sounds/success.wav' },
  { id: 'snd_fail', src: './assets/sounds/fail.wav' },
  { id: 'snd_myturn', src: './assets/sounds/myturn.wav' },
  { id: 'snd_clear', src: './assets/sounds/clear.wav' },
  { id: 'snd_over', src: './assets/sounds/over.wav' },
];

// Create fallback implementations
const fallbacks = {
  initSoundSystem: () => {
    console.error('initSoundSystem not found in SoundUtils module');
    return false;
  },
  playSound: () => {
    console.error('playSound not found in SoundUtils module');
    return null;
  },
  stopSound: () => {
    console.error('stopSound not found in SoundUtils module');
  },
  stopAllSounds: () => {
    console.error('stopAllSounds not found in SoundUtils module');
  },
  setVolume: () => {
    console.error('setVolume not found in SoundUtils module');
  },
  setSoundEnabled: () => {
    console.error('setSoundEnabled not found in SoundUtils module');
  },
  toggleSound: () => {
    console.error('toggleSound not found in SoundUtils module');
    return false;
  },
  preloadSounds: () => {
    console.error('preloadSounds not found in SoundUtils module');
    return Promise.resolve();
  },
  loadSound: () => {
    console.error('loadSound not found in SoundUtils module');
    return Promise.resolve(null);
  },
};

/**
 * Legacy-compatible async wrapper for playSound
 * Converts async promise-based function to a synchronous-looking function
 * that works with the legacy code expectation.
 * 
 * @param {string} soundId - ID of the sound to play
 * @param {Object} options - Sound options
 * @returns {Object} A placeholder sound instance object
 */
function playSoundLegacyWrapper(soundId, options = {}) {
  // Create a placeholder sound instance for compatibility
  const placeholderInstance = {
    volume: options.volume ?? 1,
    pan: 0,
    paused: false,
    loop: options.loop ?? 0,
    muted: false,
    playState: createjs ? createjs.Sound.PLAY_SUCCEEDED : 1,
    on: (event, callback) => {
      if (event === 'complete' && callback) {
        // We'll handle this by using the original promise
        SoundUtils.playSound(soundId, options)
          .then(realInstance => {
            if (realInstance) {
              realInstance.on('complete', callback);
            }
          })
          .catch(() => {
            // If play fails, still call the callback after a delay
            setTimeout(callback, 1000);
          });
      }
      return placeholderInstance;
    }
  };
  
  // Start playing asynchronously
  SoundUtils.playSound(soundId, options)
    .catch(err => console.warn(`Error playing sound in wrapper: ${soundId}`, err));
  
  // Return the placeholder immediately
  return placeholderInstance;
}

// Start loading sounds by priority
let loadingInitialized = false;

/**
 * Initialize sound loading with appropriate priority
 */
function initSoundLoading() {
  if (loadingInitialized) return;
  loadingInitialized = true;
  
  // Start loading sounds by priority
  if (SoundUtils.loadSound) {
    loadSoundsByPriority(SoundUtils.loadSound);
    
    // Create loading indicator if we're in a browser
    if (typeof document !== 'undefined') {
      // Initialize after DOM is fully loaded
      if (document.readyState === 'complete') {
        createLoadingIndicator(document.body);
      } else {
        window.addEventListener('load', () => {
          createLoadingIndicator(document.body);
        });
      }
    }
  }
}

// Export all functions to the global scope for legacy code compatibility
try {
  // Export the sound manifest to the global scope with fallback
  window.SOUND_MANIFEST = SoundUtils.SOUND_MANIFEST.length > 0 ? 
    SoundUtils.SOUND_MANIFEST : defaultSoundManifest;

  // Export all functions to the global scope for legacy code compatibility with fallbacks
  window.initSoundSystem = SoundUtils.initSoundSystem || fallbacks.initSoundSystem;
  window.playSound = playSoundLegacyWrapper; // Use the wrapped version for legacy compatibility
  window.stopSound = SoundUtils.stopSound || fallbacks.stopSound;
  window.stopAllSounds = SoundUtils.stopAllSounds || fallbacks.stopAllSounds;
  window.setVolume = SoundUtils.setVolume || fallbacks.setVolume;
  window.setSoundEnabled = SoundUtils.setSoundEnabled || fallbacks.setSoundEnabled;
  window.toggleSound = SoundUtils.toggleSound || fallbacks.toggleSound;
  window.preloadSounds = SoundUtils.preloadSounds || fallbacks.preloadSounds;
  window.loadSound = SoundUtils.loadSound || fallbacks.loadSound;

  console.log('Sound utilities bridge module initialized successfully');
  
  // Start loading sounds with priority
  initSoundLoading();
} catch (error) {
  console.error('Failed to initialize sound utilities bridge module:', error);

  // Provide fallback implementations to prevent game crashes
  window.SOUND_MANIFEST = defaultSoundManifest;
  window.initSoundSystem = fallbacks.initSoundSystem;
  window.playSound = fallbacks.playSound;
  window.stopSound = fallbacks.stopSound;
  window.stopAllSounds = fallbacks.stopAllSounds;
  window.setVolume = fallbacks.setVolume;
  window.setSoundEnabled = fallbacks.setSoundEnabled;
  window.toggleSound = fallbacks.toggleSound;
  window.preloadSounds = fallbacks.preloadSounds;
  window.loadSound = fallbacks.loadSound;
}
