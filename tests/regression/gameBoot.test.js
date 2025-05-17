import { Game } from '../../src/Game.js';

describe('Regression: Game boot sequence', () => {
  let originalMathRandom;

  beforeEach(() => {
    // Mock Math.random to ensure deterministic test results
    originalMathRandom = Math.random;
    let seed = 0.5;
    Math.random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280.0;
    };
  });

  afterEach(() => {
    // Restore original Math.random
    Math.random = originalMathRandom;
  });

  test('start_game initializes consistent state', () => {
    const game = new Game();
    game.make_map();
    game.start_game();

    const state = {
      pmax: game.pmax,
      ban: game.ban,
      playerCount: game.player.length,
      historyCount: game.his_c,
      firstAreaOwner: game.adat[1].arm,
    };

    expect(state).toMatchSnapshot();
  });
});
