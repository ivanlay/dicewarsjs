/**
 * Sound Utilities Bridge Module
 * 
 * This is a bridge module that exports ES6 module functions to the global scope
 * for compatibility with the legacy code while enabling the incremental transition to ES6.
 */

// Import ES6 module implementations
import * as SoundUtils from '../utils/sound.js';

// Also export as ES6 module for new code
export * from '../utils/sound.js';

// Default sound manifest if not available in the module
const defaultSoundManifest = [
  { id: 'button', src: 'button.wav' },
  { id: 'click', src: 'click.wav' },
  { id: 'dice', src: 'dice.wav' },
  { id: 'success', src: 'success.wav' },
  { id: 'fail', src: 'fail.wav' },
  { id: 'myturn', src: 'myturn.wav' },
  { id: 'clear', src: 'clear.wav' },
  { id: 'over', src: 'over.wav' }
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
  }
};

// Export all functions to the global scope for legacy code compatibility
try {
  // Export the sound manifest to the global scope with fallback
  window.SOUND_MANIFEST = SoundUtils.SOUND_MANIFEST || defaultSoundManifest;
  
  // Export all functions to the global scope for legacy code compatibility with fallbacks
  window.initSoundSystem = SoundUtils.initSoundSystem || fallbacks.initSoundSystem;
  window.playSound = SoundUtils.playSound || fallbacks.playSound;
  window.stopSound = SoundUtils.stopSound || fallbacks.stopSound;
  window.stopAllSounds = SoundUtils.stopAllSounds || fallbacks.stopAllSounds;
  window.setVolume = SoundUtils.setVolume || fallbacks.setVolume;
  window.setSoundEnabled = SoundUtils.setSoundEnabled || fallbacks.setSoundEnabled;
  window.toggleSound = SoundUtils.toggleSound || fallbacks.toggleSound;
  window.preloadSounds = SoundUtils.preloadSounds || fallbacks.preloadSounds;
  
  console.log('Sound utilities bridge module initialized successfully');
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
}