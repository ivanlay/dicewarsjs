/**
 * Tests for the Game-browser.js module
 */

describe('Game Browser Module', () => {
  let Game;

  beforeEach(() => {
    // Reset modules to ensure clean state
    jest.resetModules();

    // Mock all required dependencies
    jest.mock('../../src/models/index.js', () => ({
      AreaData: jest.fn().mockImplementation(() => ({})),
      PlayerData: jest.fn().mockImplementation(() => ({})),
      JoinData: jest.fn().mockImplementation(() => ({
        dir: new Array(6).fill(0),
      })),
      HistoryData: jest.fn().mockImplementation(() => ({})),
    }));

    jest.mock('../../src/mechanics/index.js', () => ({
      makeMap: jest.fn(),
      setAreaTc: jest.fn(),
      executeAttack: jest.fn(),
      distributeReinforcements: jest.fn(),
      setPlayerTerritoryData: jest.fn(),
      executeAIMove: jest.fn(),
      AI_REGISTRY: {
        ai_default: jest.fn(),
        ai_defensive: jest.fn(),
        ai_example: jest.fn(),
        ai_adaptive: jest.fn(),
      },
    }));

    jest.mock('../../src/utils/config.js', () => ({
      getConfig: jest.fn().mockReturnValue({}),
    }));

    jest.mock('../../src/utils/soundStrategy.js', () => ({
      loadSoundsByPriority: jest.fn(),
    }));

    jest.mock('../../src/utils/sound.js', () => ({
      loadSound: jest.fn(),
      getAllSoundIds: jest.fn().mockReturnValue([]),
    }));

    // Import the module after mocking dependencies
    Game = require('../../src/Game-browser.js').Game;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('exports Game class', () => {
    expect(Game).toBeDefined();
    expect(typeof Game).toBe('function');
  });

  test('Game constructor initializes basic properties', () => {
    const gameInstance = new Game();

    // Verify basic properties
    expect(gameInstance.XMAX).toBe(28);
    expect(gameInstance.YMAX).toBe(32);
    expect(gameInstance.AREA_MAX).toBe(32);
    expect(gameInstance.cel_max).toBe(gameInstance.XMAX * gameInstance.YMAX);
    expect(gameInstance.pmax).toBe(7);
    expect(gameInstance.user).toBe(0);
  });

  test('Game constructor initializes arrays', () => {
    const gameInstance = new Game();

    // Check arrays
    expect(Array.isArray(gameInstance.cel)).toBe(true);
    expect(gameInstance.cel.length).toBe(gameInstance.cel_max);

    expect(Array.isArray(gameInstance.join)).toBe(true);
    expect(gameInstance.join.length).toBe(gameInstance.cel_max);

    expect(Array.isArray(gameInstance.adat)).toBe(true);
    expect(gameInstance.adat.length).toBe(gameInstance.AREA_MAX);

    expect(Array.isArray(gameInstance.player)).toBe(true);
    expect(gameInstance.player.length).toBe(8);

    expect(Array.isArray(gameInstance.ai)).toBe(true);
    expect(gameInstance.ai.length).toBe(8);
  });

  test('next_cel calculates correct adjacent cells', () => {
    const gameInstance = new Game();

    // Test adjacent cell calculations for even row (y=0)
    const centerCell = 5; // (x=5, y=0)

    // Right direction (dir=1)
    expect(gameInstance.next_cel(centerCell, 1)).toBe(6);

    // Left direction (dir=4)
    expect(gameInstance.next_cel(centerCell, 4)).toBe(4);

    // Out of bounds check (left edge)
    expect(gameInstance.next_cel(0, 4)).toBe(-1);

    // Out of bounds check (right edge)
    expect(gameInstance.next_cel(27, 1)).toBe(-1);
  });

  test('make_map calls the makeMap function', () => {
    const gameInstance = new Game();
    const { makeMap } = require('../../src/mechanics/index.js');

    gameInstance.make_map();

    expect(makeMap).toHaveBeenCalledWith(gameInstance);
  });

  test('get_pn returns the current player index', () => {
    const gameInstance = new Game();

    // Set up jun array and ban
    gameInstance.jun = [3, 1, 4, 0, 2];
    gameInstance.ban = 2;

    expect(gameInstance.get_pn()).toBe(4);
  });

  test('applyConfig applies provided configuration', () => {
    const gameInstance = new Game();

    const testConfig = {
      playerCount: 5,
      humanPlayerIndex: 2,
      averageDicePerArea: 4,
      mapWidth: 24,
      mapHeight: 28,
      territoriesCount: 24,
      aiTypes: ['ai_default', 'ai_defensive', 'ai_example', 'ai_adaptive', null],
    };

    gameInstance.applyConfig(testConfig);

    // Verify config was applied
    expect(gameInstance.pmax).toBe(5);
    expect(gameInstance.user).toBe(2);
    expect(gameInstance.put_dice).toBe(4);
    expect(gameInstance.XMAX).toBe(24);
    expect(gameInstance.YMAX).toBe(28);
    expect(gameInstance.AREA_MAX).toBe(24);
  });
});
