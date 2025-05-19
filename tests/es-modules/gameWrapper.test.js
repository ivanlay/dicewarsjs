/**
 * Tests for the gameWrapper.js module
 */

describe('Game Wrapper Module', () => {
  let originalWindow;

  beforeEach(() => {
    // Save original window object
    originalWindow = global.window;

    // Reset modules to ensure clean state
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original window object
    global.window = originalWindow;
  });

  test('exposes Game to global scope in browser environment', () => {
    // Create a mock window object
    global.window = {};

    // Mock the Game-browser.js import
    jest.mock('../../src/Game-browser.js', () => ({
      Game: class MockGame {},
    }));

    // Import the module, which should set window.Game
    const wrapper = require('../../src/gameWrapper.js');

    // Verify window.Game is set
    expect(window.Game).toBeDefined();
    expect(typeof window.Game).toBe('function');
  });

  test('exports Game class for module usage', () => {
    // Create a mock window object
    global.window = {};

    // Mock the Game-browser.js import
    jest.mock('../../src/Game-browser.js', () => ({
      Game: class MockGame {},
    }));

    // Import the module and get exports
    const { Game } = require('../../src/gameWrapper.js');

    // Verify Game is exported
    expect(Game).toBeDefined();
    expect(typeof Game).toBe('function');

    // Verify it's the same reference as window.Game
    expect(Game).toBe(window.Game);
  });

  test('handles non-browser environment', () => {
    // Save original window
    const savedWindow = global.window;

    // Make a backup of require for later restoration
    const originalRequire = require;

    try {
      // Create a simulation where window is undefined in the module scope
      global.window = undefined;

      // Need to use isolateModules to ensure the module runs with window undefined
      jest.isolateModules(() => {
        // Mock the Game-browser.js import
        jest.mock('../../src/Game-browser.js', () => ({
          Game: class MockGame {},
        }));

        // Import the module - it should not try to set window.Game
        const { Game } = require('../../src/gameWrapper.js');

        // Verify Game is still exported
        expect(Game).toBeDefined();
        expect(typeof Game).toBe('function');
      });

      // Test passes if we got here without errors
      expect(true).toBe(true);
    } finally {
      // Restore window to prevent test interference
      global.window = savedWindow;
    }
  });
});
