/**
 * Sound Utilities Module
 *
 * Provides utilities for game sound management:
 * - Sound loading and playing
 * - Volume control
 * - Mute/unmute functionality
 * - Lazy loading and asset optimization
 */

import { getConfig, updateConfig } from './config.js';
import { updateLoadStatus } from './soundStrategy.js';

// Map of sound IDs to their file paths
// Using direct paths instead of dynamic imports to avoid MIME type issues
const soundFiles = {
  'snd_button': './sound/button.wav',   // Button click
  'snd_clear': './sound/clear.wav',     // Victory sound
  'snd_click': './sound/click.wav',     // Area selection
  'snd_dice': './sound/dice.wav',       // Dice roll
  'snd_fail': './sound/fail.wav',       // Attack failed
  'snd_myturn': './sound/myturn.wav',   // Player turn notification
  'snd_over': './sound/over.wav',       // Game over
  'snd_success': './sound/success.wav', // Attack succeeded
};

// Sound file manifest for CreateJS (populated dynamically)
export const SOUND_MANIFEST = [];

// Caches for sounds and instances
const soundInstances = {};
export const loadedSounds = new Map();

/**
 * Load a sound file and register it with CreateJS
 * @param {string} soundId - ID of the sound to load
 * @returns {Promise<string>} Promise that resolves to the sound path
 */
export async function loadSound(soundId) {
  // Return from cache if already loaded
  if (loadedSounds.has(soundId)) {
    return loadedSounds.get(soundId);
  }

  // Check if this sound exists in our manifest
  if (!soundFiles[soundId]) {
    console.warn(`Sound not found: ${soundId}`);
    return null;
  }

  // Track loading state
  updateLoadStatus(1);

  try {
    // Get the sound path directly
    const soundPath = soundFiles[soundId];

    // Store in cache
    loadedSounds.set(soundId, soundPath);
    
    // Register with CreateJS if it's available
    if (typeof createjs !== 'undefined' && createjs.Sound) {
      // Ensure correct initialization
      if (!createjs.Sound._initializeDefaultPluginsWasCalled) {
        createjs.Sound.initializeDefaultPlugins();
      }
      
      // Use registerSound with explicit type to avoid MIME issues
      const result = createjs.Sound.registerSound({
        src: soundPath,
        id: soundId,
        type: "wav"  // Explicitly set the file type to avoid MIME detection issues
      });
      
      if (!result) {
        console.warn(`RegisterSound failed for ${soundId} at ${soundPath}`);
      }
    }
    
    // Update manifest for future reference
    SOUND_MANIFEST.push({
      id: soundId,
      src: soundPath
    });
    
    return soundPath;
  } catch (err) {
    console.error(`Failed to load sound: ${soundId}`, err);
    return null;
  } finally {
    // Update loading state
    updateLoadStatus(-1);
  }
}

/**
 * Initialize the sound system
 * @returns {boolean} True if initialization succeeded
 */
export function initSoundSystem() {
  if (typeof createjs === 'undefined' || !createjs.Sound) {
    console.warn('Sound system not supported in this browser');
    return false;
  }
  
  try {
    // Initialize default plugins only on user interaction
    // This avoids AudioContext autoplay issues in browsers
    if (!createjs.Sound._initializeDefaultPluginsWasCalled) {
      createjs.Sound.initializeDefaultPlugins();
    }
    
    // Configure CreateJS to use HTML5 audio
    if (createjs.Sound.activePlugin?.capabilities) {
      // Explicitly set preferred MIME types and extensions
      createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);
    }

    // Pre-create sound instances to avoid undefined issues
    Object.keys(soundFiles).forEach(soundId => {
      soundInstances[soundId] = null;
    });
    
    // Pre-load the manifest
    for (const [soundId, soundPath] of Object.entries(soundFiles)) {
      SOUND_MANIFEST.push({
        id: soundId,
        src: soundPath,
        type: "wav"
      });
    }
    
    // We'll register sounds as they're loaded
    return true;
  } catch (error) {
    console.error("Error initializing sound system:", error);
    return false;
  }
}

/**
 * Play a sound, loading it first if needed
 * @param {string} soundId - ID of the sound to play
 * @param {Object} [options={}] - Sound options
 * @param {number} [options.volume=1] - Volume (0-1)
 * @param {number} [options.loop=0] - Number of times to loop (-1 for infinite)
 * @param {Function} [options.onComplete=null] - Callback when sound completes
 * @returns {Promise<createjs.AbstractSoundInstance|null>} Sound instance or null if sound disabled
 */
export async function playSound(soundId, options = {}) {
  const config = getConfig();
  if (!config.soundEnabled) return null;

  // Ensure the sound is loaded
  await loadSound(soundId);

  try {
    // Initialize sound system if not already done
    // This helps with AudioContext autoplay restrictions
    if (typeof createjs !== 'undefined' && createjs.Sound && 
        !createjs.Sound._initializeDefaultPluginsWasCalled) {
      createjs.Sound.initializeDefaultPlugins();
    }

    // Use the modern createjs API to avoid deprecation warnings
    const instance = createjs.Sound.play(soundId);
    
    // Modern approach to setting properties
    if (instance) {
      instance.volume = options.volume ?? 1;
      if (options.loop) instance.loop = options.loop;
      instance.interrupt = createjs.Sound.INTERRUPT_ANY;
    }

    if (options.onComplete) {
      instance.on('complete', options.onComplete);
    }

    // Cache the instance for volume control
    soundInstances[soundId] = instance;

    return instance;
  } catch (e) {
    console.warn(`Error playing sound: ${soundId}`, e);
    return null;
  }
}

/**
 * Stop a sound
 * @param {string} soundId - ID of the sound to stop
 */
export function stopSound(soundId) {
  if (typeof createjs !== 'undefined' && createjs.Sound) {
    createjs.Sound.stop(soundId);
  }
}

/**
 * Stop all sounds
 */
export function stopAllSounds() {
  if (typeof createjs !== 'undefined' && createjs.Sound) {
    createjs.Sound.stop();
  }
}

/**
 * Set sound volume
 * @param {number} volume - Volume level (0-1)
 */
export function setVolume(volume) {
  if (typeof createjs === 'undefined' || !createjs.Sound) return;
  
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
 * @returns {boolean} Current sound enabled state
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
export async function preloadSounds() {
  // Load all sounds in the manifest
  const loadPromises = Object.keys(soundFiles).map(soundId => loadSound(soundId));
  return Promise.all(loadPromises);
}

/**
 * Get all available sound IDs
 * @returns {Array<string>} Array of sound IDs
 */
export function getAllSoundIds() {
  return Object.keys(soundFiles);
}
