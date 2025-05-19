/**
 * Global Exports Tests for Bridge Modules
 */

describe('Bridge Module Global Exports', () => {
  beforeEach(() => {
    jest.resetModules();
    global.window = global.window || {};
    global.process = global.process || { env: { NODE_ENV: 'development' } };
  });

  test('Game bridge exposes Game class globally', () => {
    require('../../src/bridge/Game.js');
    const { Game } = require('../../src/Game.js');
    expect(window.Game).toBe(Game);
  });

  test('AI bridge exposes AI functions globally', async () => {
    await import('../../src/bridge/ai.js');
    await new Promise(resolve => setImmediate(resolve));

    expect(typeof window.ai_default).toBe('function');
    expect(typeof window.ai_defensive).toBe('function');
    expect(typeof window.ai_example).toBe('function');
    expect(typeof window.ai_adaptive).toBe('function');
  });

  test('gameUtils bridge exposes utility functions globally', () => {
    require('../../src/bridge/gameUtils.js');
    const utils = require('../../src/utils/gameUtils.js');

    expect(window.calculateAttackProbability).toBe(utils.calculateAttackProbability);
    expect(window.rollDice).toBe(utils.rollDice);
  });

  test('render bridge exposes rendering helpers globally', () => {
    require('../../src/bridge/render.js');
    const render = require('../../src/utils/render.js');

    expect(window.COLORS).toBeDefined();
    expect(window.scaleValue).toBe(render.scaleValue);
    expect(window.createText).toBe(render.createText);
  });

  test('sound bridge exposes sound helpers globally', () => {
    require('../../src/bridge/sound.js');

    expect(typeof window.playSound).toBe('function');
    expect(Array.isArray(window.SOUND_MANIFEST)).toBe(true);
  });

  test('ui bridge exposes draw_player_data globally', () => {
    require('../../src/bridge/ui.js');
    const { drawPlayerData } = require('../../src/ui/playerStatus.js');

    expect(window.draw_player_data).toBe(drawPlayerData);
  });

  test('debugTools bridge exposes DEBUG_TOOLS globally in development', () => {
    process.env.NODE_ENV = 'development';
    require('../../src/bridge/debugTools.js');

    expect(window.DEBUG_TOOLS).toBeDefined();
    expect(typeof window.toggleDebugMode).toBe('function');
  });
});
