/**
 * Test file for game-loader.js
 *
 * This tests the placeholder AI functions and registry created by game-loader.js
 */

describe('Game Loader', () => {
  // Store original window object and console methods
  const originalWindow = { ...window };
  const originalConsole = { ...console };

  beforeEach(() => {
    // Mock window and console
    global.window = {
      ...originalWindow,
      ES6_LOADING_STARTED: false,
    };

    global.console = {
      log: jest.fn(),
      warn: jest.fn(),
    };

    // Reset document after each test
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original window and console
    global.window = originalWindow;
    global.console = originalConsole;
  });

  test('should set up placeholder AI functions', () => {
    // Load the game-loader module
    require('../../src/game-loader.js');

    // Verify AI functions are defined
    expect(typeof window.ai_default).toBe('function');
    expect(typeof window.ai_defensive).toBe('function');
    expect(typeof window.ai_example).toBe('function');
    expect(typeof window.ai_adaptive).toBe('function');

    // Verify the AI registry is set up correctly
    expect(window.AI_REGISTRY).toBeDefined();
    expect(window.AI_REGISTRY.ai_default).toBe(window.ai_default);
    expect(window.AI_REGISTRY.ai_defensive).toBe(window.ai_defensive);
    expect(window.AI_REGISTRY.ai_example).toBe(window.ai_example);
    expect(window.AI_REGISTRY.ai_adaptive).toBe(window.ai_adaptive);
  });

  test('ai_default should make random valid moves', () => {
    // Load the game-loader module
    require('../../src/game-loader.js');

    // Mock game object
    const mockGame = {
      adat: [
        { arm: 1, dice: 3, join: [0, 1, 1, 0] }, // Index 0: Player 1 territory with 3 dice
        { arm: 2, dice: 2, join: [1, 0, 0, 1] }, // Index 1: Player 2 territory with 2 dice
        { arm: 1, dice: 1, join: [1, 0, 0, 0] }, // Index 2: Player 1 territory with 1 dice
        { arm: 2, dice: 4, join: [0, 1, 0, 0] }, // Index 3: Player 2 territory with 4 dice
      ],
      get_pn: jest.fn().mockReturnValue(1), // Current player is 1
      area_from: null,
      area_to: null,
    };

    // Call ai_default function
    const result = window.ai_default(mockGame);

    // Verify warning is logged when ES6_LOADING_STARTED is false
    expect(console.warn).toHaveBeenCalledWith(
      'Using placeholder ai_default - ES6 module not loaded'
    );

    /*
     * Verify attack is set up or function returns 0
     * Using this approach to avoid conditional expect calls
     */
    expect(result === 0 || (mockGame.area_from === 0 && mockGame.area_to === 1)).toBe(true);
  });

  test('ai_default should end turn when no valid moves exist', () => {
    // Load the game-loader module
    require('../../src/game-loader.js');

    // Mock game object with no valid moves
    const mockGame = {
      adat: [
        { arm: 1, dice: 1, join: [0, 1, 0, 0] }, // Player 1 territory with only 1 die
        { arm: 2, dice: 5, join: [1, 0, 0, 0] }, // Player 2 territory with 5 dice
        { arm: 3, dice: 4, join: [0, 0, 0, 0] }, // Player 3 territory
      ],
      get_pn: jest.fn().mockReturnValue(1), // Current player is 1
      area_from: null,
      area_to: null,
    };

    // Call ai_default function
    const result = window.ai_default(mockGame);

    // Should return 0 to end turn when no valid moves exist
    expect(result).toBe(0);
  });

  test('other AI placeholders should call ai_default', () => {
    // Load the game-loader module
    require('../../src/game-loader.js');

    // Mock the ai_default function
    const originalAiDefault = window.ai_default;
    window.ai_default = jest.fn().mockReturnValue(42);

    // Mock game object
    const mockGame = { get_pn: jest.fn().mockReturnValue(1) };

    // Call each of the other AI functions
    const defResult = window.ai_defensive(mockGame);
    const exampleResult = window.ai_example(mockGame);
    const adaptiveResult = window.ai_adaptive(mockGame);

    // Verify each AI called ai_default
    expect(window.ai_default).toHaveBeenCalledTimes(3);
    expect(window.ai_default).toHaveBeenCalledWith(mockGame);

    // Verify each AI returned the value from ai_default
    expect(defResult).toBe(42);
    expect(exampleResult).toBe(42);
    expect(adaptiveResult).toBe(42);

    // Restore original ai_default
    window.ai_default = originalAiDefault;
  });

  test('getAIFunctionByName should return the correct AI function', () => {
    // Load the game-loader module
    require('../../src/game-loader.js');

    // Test valid AI names
    expect(window.getAIFunctionByName('ai_default')).toBe(window.ai_default);
    expect(window.getAIFunctionByName('ai_defensive')).toBe(window.ai_defensive);
    expect(window.getAIFunctionByName('ai_example')).toBe(window.ai_example);
    expect(window.getAIFunctionByName('ai_adaptive')).toBe(window.ai_adaptive);

    // Test invalid AI names
    expect(window.getAIFunctionByName('nonexistent_ai')).toBe(window.ai_default);
    expect(window.getAIFunctionByName(null)).toBe(window.ai_default);
    expect(window.getAIFunctionByName(undefined)).toBe(window.ai_default);
    expect(window.getAIFunctionByName(123)).toBe(window.ai_default);

    // Verify warning is logged for invalid AI name
    expect(console.warn).toHaveBeenCalledWith('AI type nonexistent_ai not found, using default AI');
  });

  test('should not log warnings when ES6_LOADING_STARTED is true', () => {
    // Set ES6_LOADING_STARTED to true
    window.ES6_LOADING_STARTED = true;

    // Load the game-loader module
    require('../../src/game-loader.js');

    // Mock game object
    const mockGame = {
      adat: [],
      get_pn: jest.fn().mockReturnValue(1),
    };

    // Call all AI functions
    window.ai_default(mockGame);
    window.ai_defensive(mockGame);
    window.ai_example(mockGame);
    window.ai_adaptive(mockGame);

    // Verify no warnings were logged
    expect(console.warn).not.toHaveBeenCalled();
  });

  test('should set up GAME_CONFIG placeholder if not already defined', () => {
    // Ensure GAME_CONFIG is not defined
    delete window.GAME_CONFIG;

    // Load the game-loader module
    require('../../src/game-loader.js');

    // Verify GAME_CONFIG is now defined
    expect(window.GAME_CONFIG).toBeDefined();
    expect(typeof window.GAME_CONFIG).toBe('object');
  });

  test('should not overwrite existing GAME_CONFIG', () => {
    // Set up existing GAME_CONFIG
    window.GAME_CONFIG = { existingProp: 'value' };

    // Load the game-loader module
    require('../../src/game-loader.js');

    // Verify GAME_CONFIG still has existing property
    expect(window.GAME_CONFIG.existingProp).toBe('value');
  });
});
