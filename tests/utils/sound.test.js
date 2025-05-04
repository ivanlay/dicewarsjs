/**
 * Tests for Sound Utilities Module
 */
import {
  SOUND_MANIFEST,
  initSoundSystem,
  playSound,
  stopSound,
  stopAllSounds,
  setVolume,
  setSoundEnabled,
  toggleSound
} from '../../src/utils/sound.js';

// Mock the config module
jest.mock('../../src/utils/config.js', () => ({
  getConfig: jest.fn().mockReturnValue({ soundEnabled: true }),
  updateConfig: jest.fn()
}));

describe('Sound Utilities', () => {
  // Spy on createjs.Sound methods
  beforeEach(() => {
    jest.clearAllMocks();
    createjs.Sound.play = jest.fn().mockReturnValue({
      on: jest.fn(),
      volume: 1,
      playState: createjs.Sound.PLAY_SUCCEEDED
    });
    createjs.Sound.stop = jest.fn();
    createjs.Sound.initializeDefaultPlugins = jest.fn().mockReturnValue(true);
    createjs.Sound.registerSounds = jest.fn();
  });

  describe('SOUND_MANIFEST', () => {
    test('contains the correct sound files', () => {
      expect(SOUND_MANIFEST.length).toBe(8);
      expect(SOUND_MANIFEST.find(s => s.id === 'snd_button')).toBeTruthy();
      expect(SOUND_MANIFEST.find(s => s.id === 'snd_dice')).toBeTruthy();
    });
  });
  
  describe('initSoundSystem', () => {
    test('initializes the sound system', () => {
      expect(initSoundSystem()).toBe(true);
      expect(createjs.Sound.initializeDefaultPlugins).toHaveBeenCalled();
      expect(createjs.Sound.registerSounds).toHaveBeenCalledWith(SOUND_MANIFEST);
    });
    
    test('returns false if sound system cannot be initialized', () => {
      createjs.Sound.initializeDefaultPlugins.mockReturnValueOnce(false);
      expect(initSoundSystem()).toBe(false);
    });
  });
  
  describe('playSound', () => {
    test('plays a sound with default options', () => {
      const result = playSound('snd_button');
      expect(createjs.Sound.play).toHaveBeenCalledWith('snd_button', {
        volume: 1,
        loop: 0,
        interrupt: createjs.Sound.INTERRUPT_ANY
      });
      expect(result).toBeTruthy();
    });
    
    test('plays a sound with custom options', () => {
      const options = {
        volume: 0.5,
        loop: 2,
        onComplete: jest.fn()
      };
      
      const mockInstance = {
        on: jest.fn(),
        volume: 1,
        playState: createjs.Sound.PLAY_SUCCEEDED
      };
      createjs.Sound.play.mockReturnValueOnce(mockInstance);
      
      const result = playSound('snd_button', options);
      expect(createjs.Sound.play).toHaveBeenCalledWith('snd_button', {
        volume: 0.5,
        loop: 2,
        interrupt: createjs.Sound.INTERRUPT_ANY
      });
      expect(mockInstance.on).toHaveBeenCalledWith('complete', options.onComplete);
      expect(result).toBe(mockInstance);
    });
    
    test('returns null if sound is disabled', () => {
      // Mock getConfig to return soundEnabled: false
      const { getConfig } = require('../../src/utils/config.js');
      getConfig.mockReturnValueOnce({ soundEnabled: false });
      
      const result = playSound('snd_button');
      expect(createjs.Sound.play).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('stopSound', () => {
    test('stops a specific sound', () => {
      stopSound('snd_button');
      expect(createjs.Sound.stop).toHaveBeenCalledWith('snd_button');
    });
  });
  
  describe('stopAllSounds', () => {
    test('stops all sounds', () => {
      stopAllSounds();
      expect(createjs.Sound.stop).toHaveBeenCalled();
    });
  });
});