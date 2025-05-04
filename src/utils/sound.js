/**
 * Sound Utilities Module
 *
 * Provides utilities for game sound management:
 * - Sound loading and playing
 * - Volume control
 * - Mute/unmute functionality
 */

import { getConfig, updateConfig } from './config.js';

// Sound file manifest
export const SOUND_MANIFEST = [
  { id: 'snd_button', src: './sound/button.wav' }, // Button click
  { id: 'snd_clear', src: './sound/clear.wav' }, // Victory sound
  { id: 'snd_click', src: './sound/click.wav' }, // Area selection
  { id: 'snd_dice', src: './sound/dice.wav' }, // Dice roll
  { id: 'snd_fail', src: './sound/fail.wav' }, // Attack failed
  { id: 'snd_myturn', src: './sound/myturn.wav' }, // Player turn notification
  { id: 'snd_over', src: './sound/over.wav' }, // Game over
  { id: 'snd_success', src: './sound/success.wav' }, // Attack succeeded
];

// Sound instances cache
const soundInstances = {};

/**
 * Initialize the sound system
 * @returns {boolean} True if initialization succeeded
 */
export function initSoundSystem() {
  if (!createjs.Sound.initializeDefaultPlugins()) {
    console.warn('Sound system not supported in this browser');
    return false;
  }

  createjs.Sound.registerSounds(SOUND_MANIFEST);
  return true;
}

/**
 * Play a sound
 * @param {string} soundId - ID of the sound to play
 * @param {Object} [options={}] - Sound options
 * @param {number} [options.volume=1] - Volume (0-1)
 * @param {number} [options.loop=0] - Number of times to loop (-1 for infinite)
 * @param {Function} [options.onComplete=null] - Callback when sound completes
 * @returns {createjs.AbstractSoundInstance|null} Sound instance or null if sound disabled
 */
export function playSound(soundId, options = {}) {
  const config = getConfig();
  if (!config.soundEnabled) return null;

  try {
    const instance = createjs.Sound.play(soundId, {
      volume: options.volume ?? 1,
      loop: options.loop ?? 0,
      interrupt: createjs.Sound.INTERRUPT_ANY,
    });

    if (options.onComplete) {
      instance.on('complete', options.onComplete);
    }

    // Cache the instance for volume control
    soundInstances[soundId] = instance;

    return instance;
  } catch (e) {
    console.warn('Error playing sound:', e);
    return null;
  }
}

/**
 * Stop a sound
 * @param {string} soundId - ID of the sound to stop
 */
export function stopSound(soundId) {
  createjs.Sound.stop(soundId);
}

/**
 * Stop all sounds
 */
export function stopAllSounds() {
  createjs.Sound.stop();
}

/**
 * Set sound volume
 * @param {number} volume - Volume level (0-1)
 */
export function setVolume(volume) {
  createjs.Sound.volume = Math.max(0, Math.min(1, volume));

  // Update each active sound instance
  Object.values(soundInstances).forEach(instance => {
    if (instance && instance.playState === createjs.Sound.PLAY_SUCCEEDED) {
      instance.volume = createjs.Sound.volume;
    }
  });
}

/**
 * Enable or disable sound
 * @param {boolean} enabled - Whether sound should be enabled
 */
export function setSoundEnabled(enabled) {
  const config = getConfig();
  updateConfig({ soundEnabled: enabled });

  if (!enabled) {
    stopAllSounds();
  }

  return config.soundEnabled;
}

/**
 * Toggle sound on/off
 * @returns {boolean} New sound state (true = enabled)
 */
export function toggleSound() {
  const config = getConfig();
  return setSoundEnabled(!config.soundEnabled);
}

/**
 * Preload all sounds
 * @returns {Promise} Promise that resolves when all sounds are loaded
 */
export function preloadSounds() {
  return new Promise((resolve, reject) => {
    if (!createjs.Sound.initializeDefaultPlugins()) {
      reject(new Error('Sound system not supported'));
      return;
    }

    const queue = new createjs.LoadQueue();
    queue.installPlugin(createjs.Sound);
    queue.loadManifest(SOUND_MANIFEST);

    queue.on('complete', resolve);
    queue.on('error', reject);
  });
}
