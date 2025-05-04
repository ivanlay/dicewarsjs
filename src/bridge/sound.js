/**
 * Sound Utilities Bridge Module
 * 
 * This is a bridge module that exports ES6 module functions to the global scope
 * for compatibility with the legacy code while enabling the incremental transition to ES6.
 */

// Import ES6 module implementations
import * as SoundUtils from '../utils/sound.js';

// Export the sound manifest to the global scope
window.SOUND_MANIFEST = SoundUtils.SOUND_MANIFEST;

// Export all functions to the global scope for legacy code compatibility
window.initSoundSystem = SoundUtils.initSoundSystem;
window.playSound = SoundUtils.playSound;
window.stopSound = SoundUtils.stopSound;
window.stopAllSounds = SoundUtils.stopAllSounds;
window.setVolume = SoundUtils.setVolume;
window.setSoundEnabled = SoundUtils.setSoundEnabled;
window.toggleSound = SoundUtils.toggleSound;
window.preloadSounds = SoundUtils.preloadSounds;

// Also export as ES6 module for new code
export * from '../utils/sound.js';