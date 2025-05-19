/**
 * Integration test simulating legacy script order where bridges load first.
 */

describe('Legacy Script Loading Order', () => {
  const setupMcjsMock = () => {
    global.lib = global.lib || {};
    const mcInit = jest.fn((libObj, _img, _cjs, _ss) => {
      libObj.webFontTxtFilters = {};
      libObj.properties = {
        id: 'TEST',
        width: 512,
        height: 96,
        fps: 24,
        color: '#CCCCCC',
        webfonts: {},
      };
      libObj.ssMetadata = [];
      libObj.areadice = function () {};
      libObj.mc = function () {};
    });
    mcInit(global.lib, global.images || {}, global.cjs, global.ss || {});
  };

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '<canvas id="myCanvas"></canvas>';
    global.createjs = global.cjs;
  });

  test('bridges initialize before legacy code executes', async () => {
    require('../../src/game-loader.js');
    require('../../src/bridge/index.js');
    await new Promise(resolve => setImmediate(resolve));
    await import('../../src/bridge/ai.js');
    await new Promise(resolve => setImmediate(resolve));

    const { Game } = require('../../src/Game.js');
    const aiBefore = window.ai_default;
    expect(window.Game).toBe(Game);
    expect(typeof aiBefore).toBe('function');

    setupMcjsMock();
    require('../../game.js');
    require('../../config.js');
    require('../../main.js');

    window.dispatchEvent(new Event('load'));

    const instance = new window.Game();
    expect(instance).toBeInstanceOf(Game);
    expect(window.ai_default).toBe(aiBefore);
  });
});
