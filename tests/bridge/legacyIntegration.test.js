/**
 * Bridge-to-Legacy Integration Tests
 *
 * These tests simulate loading legacy scripts alongside the bridge modules
 * to ensure that legacy entry points can call modern APIs.
 */

// Setup a mock for mc.js that doesn't require full MovieClip functionality
const setupMcjsMock = () => {
  // Mock lib definitions that mc.js creates
  global.lib = global.lib || {};

  // Create the anonymous function wrapper that mc.js expects
  const mcInit = jest.fn((lib, img, cjs, ss) => {
    // Mock basic lib properties that mc.js sets
    lib.webFontTxtFilters = {};
    lib.properties = {
      id: '3E13D973BC77BC4C8FACCBFB17F1C6B9',
      width: 512,
      height: 96,
      fps: 24,
      color: '#CCCCCC',
      webfonts: {},
    };
    lib.ssMetadata = [];

    // Set up some basic lib exports that main.js might use
    lib.YOUWIN = function () {};
    lib.symbol = function () {};
    lib.td3 = function () {};
    lib.td2 = function () {};
    lib.td1 = function () {};
    lib.GAMEOVER = function () {};
    lib.TITLE = function () {};
    lib.mc = function () {};
    lib.areadice = function () {}; // Added areadice since main.js needs it
  });

  // Execute the mock initialization
  mcInit(global.lib, global.images || {}, global.cjs, global.ss || {});
};

describe('Bridge to Legacy Integration', () => {
  let originalWindow;

  beforeEach(() => {
    jest.resetModules();
    // fresh DOM with canvas element for main.js
    document.body.innerHTML = '<canvas id="myCanvas"></canvas>';

    // Ensure global MovieClip functions correctly for mc.js
    global.createjs = global.cjs;

    // Save original window for restoration
    originalWindow = global.window;
  });

  afterEach(() => {
    // Restore original window
    global.window = originalWindow;
  });

  test('legacy game.js uses bridged Game class', () => {
    // Load placeholders then bridges
    require('../../src/game-loader.js');
    require('../../src/bridge/index.js');

    // Load legacy game.js which expects Game in global scope
    require('../../game.js');

    const game = new window.Game();
    game.make_map();
    expect(() => game.start_game()).not.toThrow();

    // AI functions should be assigned from bridge
    game.start_game();
    game.ai.slice(1).forEach(fn => expect(typeof fn).toBe('function'));
  });

  test('main.js loads and creates proper environment', () => {
    // Mock a window object that will capture global variables
    const mockWindow = { ...global.window };
    global.window = mockWindow;

    require('../../src/game-loader.js');
    require('../../src/bridge/index.js');
    require('../../config.js');

    /*
     * Instead of loading the real mc.js which has complex CreateJS dependencies,
     * set up a mock that provides what main.js needs
     */
    setupMcjsMock();

    require('../../game.js');

    // Before loading main.js, we need to ensure applyGameConfig is available
    global.applyGameConfig = jest.fn();

    // main.js creates the game instance and other globals
    require('../../main.js');

    // Verify that main.js set up the required globals
    expect(global.Game).toBeDefined();
    expect(global.applyGameConfig).toHaveBeenCalled();

    // Check that AI functions are properly set up in the game instance
    const gameArg = global.applyGameConfig.mock.calls[0][0];
    expect(gameArg).toBeDefined();
    expect(gameArg.ai).toBeDefined();
    expect(gameArg.ai.length).toBeGreaterThan(1);
  });
});
