/**
 * Sound Bridge Module
 * 
 * This file serves as a bridge between ES6 modules and the legacy global variables code
 * for sound functions.
 */

import { 
  initSoundSystem, 
  playSound, 
  stopSound, 
  stopAllSounds, 
  setVolume,
  toggleSound,
  setSoundEnabled,
  preloadSounds,
  getAllSoundIds
} from '../utils/sound.js';

// Create a manifest compatible with the original code
const soundManifest = [
  { src: './assets/sounds/button.wav', id: 'snd_button' },
  { src: './assets/sounds/clear.wav', id: 'snd_clear' },
  { src: './assets/sounds/click.wav', id: 'snd_click' },
  { src: './assets/sounds/dice.wav', id: 'snd_dice' },
  { src: './assets/sounds/fail.wav', id: 'snd_fail' },
  { src: './assets/sounds/myturn.wav', id: 'snd_myturn' },
  { src: './assets/sounds/over.wav', id: 'snd_over' },
  { src: './assets/sounds/success.wav', id: 'snd_success' }
];

// Export sound functions to global scope
window.initSoundSystem = initSoundSystem;
window.playSound = playSound;
window.stopSound = stopSound;
window.stopAllSounds = stopAllSounds;
window.setVolume = setVolume;
window.toggleSound = toggleSound;
window.setSoundEnabled = setSoundEnabled;
window.preloadSounds = preloadSounds;
window.getAllSoundIds = getAllSoundIds;

// For legacy code compatibility
window.soundon = true;
window.manifest = soundManifest;

// Mimic the original sound handling functions
window.startSound = function(soundId) {
  // Create sound instance for later playback (handled by the ES6 module)
  console.log('Creating sound instance:', soundId);
};

window.handleFileLoad = function(event) {
  if (event.item && event.item.type === 'sound') {
    window.startSound(event.item.id);
  }
};

window.handleComplete = function() {
  console.log('All sounds loaded');
};

// Export for ES6 module usage
export {
  initSoundSystem,
  playSound,
  stopSound,
  stopAllSounds,
  setVolume,
  toggleSound,
  setSoundEnabled,
  preloadSounds,
  getAllSoundIds,
  soundManifest
};