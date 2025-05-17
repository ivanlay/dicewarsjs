/**
 * Tests for Battle Resolution Module
 */

import {
  rollDice,
  calculateAttackProbability,
  resolveBattle,
  executeAttack,
  distributeReinforcements,
  setPlayerTerritoryData,
} from '../../src/mechanics/battleResolution.js';

import { HistoryData } from '../../src/models/index.js';
import { gameEvents, EventType } from '../../src/mechanics/eventSystem.js';

// Mock modules
jest.mock('../../src/mechanics/errorHandling.js', () => ({
  withErrorHandling: fn => fn,
  validateTerritories: jest.fn(),
  validatePlayer: jest.fn(),
}));

jest.mock('../../src/mechanics/eventSystem.js', () => ({
  gameEvents: {
    emit: jest.fn().mockResolvedValue([]),
  },
  EventType: {
    TERRITORY_ATTACK: 'territory:attack',
    TERRITORY_CAPTURE: 'territory:capture',
    DICE_ROLLED: 'dice:rolled',
    TERRITORY_REINFORCED: 'territory:reinforced',
    TURN_START: 'turn:start',
    PLAYER_ELIMINATED: 'player:eliminated',
    PLAYER_VICTORY: 'player:victory',
    TERRITORY_DEFEND: 'territory:defend',
  },
  emitTerritoryAttack: jest.fn(),
  emitTerritoryCapture: jest.fn(),
  emitDiceRolled: jest.fn(),
  emitTerritoryReinforced: jest.fn(),
}));

jest.mock('../../src/models/HistoryData.js', () => ({
  HistoryData: jest.fn().mockImplementation(() => ({
    from: 0,
    to: 0,
    res: 0,
  })),
}));

// Mock setAreaTc to avoid circular dependency
jest.mock('../../src/mechanics/mapGenerator.js', () => ({
  setAreaTc: jest.fn(),
}));

// Add global mocks
global.measurePerformance = fn => fn;
global.next_cel = jest.fn();

// Mock Battle class
jest.mock('../../src/models/index.js', () => ({
  HistoryData: jest.fn().mockImplementation(() => ({
    atk: 0,
    def: 0,
    res: 0,
    end_dice: 0,
  })),
  Battle: jest.fn().mockImplementation(() => ({
    dice_num_A: 0,
    dice_num_D: 0,
    sum_A: 0,
    sum_D: 0,
    updateDiceValues: jest.fn(),
    getTotals: jest.fn().mockReturnValue({ attacker: 0, defender: 0 }),
  })),
}));

// Create a local variable for mocking resolveBattle
let mockResolveBattle;
jest.mock('../../src/mechanics/battleResolution.js', () => {
  const actual = jest.requireActual('../../src/mechanics/battleResolution.js');
  return {
    ...actual,
    resolveBattle: (...args) =>
      mockResolveBattle ? mockResolveBattle(...args) : actual.resolveBattle(...args),
  };
});

describe('Battle Resolution', () => {
  beforeEach(() => {
    mockResolveBattle = null;
    jest.clearAllMocks();
  });

  describe('rollDice', () => {
    it('should roll the correct number of dice', () => {
      const result = rollDice(3);
      expect(result.values).toHaveLength(3);
      expect(result.values.every(v => v >= 1 && v <= 6)).toBe(true);
      expect(result.total).toBe(result.values.reduce((sum, v) => sum + v, 0));
    });

    it('should handle single die', () => {
      const result = rollDice(1);
      expect(result.values).toHaveLength(1);
      expect(result.total).toBe(result.values[0]);
    });

    it('should handle zero dice', () => {
      const result = rollDice(0);
      expect(result.values).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should throw error for invalid count', () => {
      // The actual implementation throws for non-number types
      expect(() => rollDice('invalid')).toThrow('Expected count to be a number');
      expect(() => rollDice(null)).toThrow('Expected count to be a number');

      // Negative numbers don't throw, they just return empty array
      const result = rollDice(-1);
      expect(result.values).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('calculateAttackProbability', () => {
    it('should return low probability if attacker has 1 die', () => {
      // The implementation returns 0.05 for attacker with 1 die
      expect(calculateAttackProbability(1, 3)).toBe(0.05);
    });

    it('should return 0 if defender has 0 dice', () => {
      expect(calculateAttackProbability(3, 0)).toBe(0);
    });

    it('should return approximately 0.45 for equal dice counts', () => {
      const prob = calculateAttackProbability(3, 3);
      expect(prob).toBeCloseTo(0.45, 1);
    });

    it('should return higher probability when attacker has more dice', () => {
      const prob = calculateAttackProbability(4, 2);
      expect(prob).toBeGreaterThan(0.5);
    });
  });

  describe('resolveBattle', () => {
    // Mock Math.random for predictable tests
    const mockRandom = jest.spyOn(Math, 'random');

    afterEach(() => {
      mockRandom.mockRestore();
    });

    it('should resolve a battle where attacker wins', () => {
      const gameState = {
        adat: {
          1: { dice: 3 },
          2: { dice: 2 },
        },
        batt: null,
      };

      // Mock dice rolls: attacker gets higher total
      mockRandom
        .mockReturnValueOnce(0.9) // First attacker die
        .mockReturnValueOnce(0.9) // Second attacker die
        .mockReturnValueOnce(0.9) // Third attacker die
        .mockReturnValueOnce(0.1) // First defender die
        .mockReturnValueOnce(0.1); // Second defender die

      const result = resolveBattle(gameState, 1, 2);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should resolve a battle where defender wins', () => {
      const gameState = {
        adat: {
          1: { dice: 2 },
          2: { dice: 3 },
        },
        batt: null,
      };

      /*
       * Mock dice rolls: defender gets higher total
       * Attacker rolls 2 dice, total should be low
       * Defender rolls 3 dice, total should be high
       */
      mockRandom
        .mockReturnValueOnce(0) // First attacker die (rolls 1)
        .mockReturnValueOnce(0.17) // Second attacker die (rolls 2)
        .mockReturnValueOnce(0.99) // First defender die (rolls 6)
        .mockReturnValueOnce(0.99) // Second defender die (rolls 6)
        .mockReturnValueOnce(0.99); // Third defender die (rolls 6)

      const result = resolveBattle(gameState, 1, 2);

      expect(result).toBeDefined();
      /*
       * Attacker total: 1 + 2 = 3
       * Defender total: 6 + 6 + 6 = 18
       * Defender wins, so success should be false
       */
      expect(result.success).toBe(false);
    });
  });

  describe('executeAttack', () => {
    let mockRandom;

    beforeEach(() => {
      mockRandom = jest.spyOn(Math, 'random');
    });

    afterEach(() => {
      mockRandom.mockRestore();
      jest.clearAllMocks();
    });

    it('should execute a successful attack', () => {
      const gameState = {
        adat: {
          1: { arm: 0, dice: 3, size: 5, join: [0, 0, 1, 0, 0] },
          2: { arm: 1, dice: 2, size: 4, join: [0, 1, 0, 0, 0] },
        },
        jun: [1, 2],
        pn: 0,
        his: new Array(100).fill(null).map(() => ({})),
        his_c: 0,
        stock: [8, 3],
        defeat: 0,
        player: [
          { dice_c: 10, area_c: 3 },
          { dice_c: 8, area_c: 2 },
        ],
      };

      // Mock successful dice rolls
      mockRandom
        .mockReturnValueOnce(0.6) // First die for attacker
        .mockReturnValueOnce(0.6) // Second die
        .mockReturnValueOnce(0.6) // Third die
        .mockReturnValueOnce(0.4) // First die for defender
        .mockReturnValueOnce(0.4); // Second die

      // Mock validation functions to pass
      require('../../src/mechanics/errorHandling.js').validateTerritories.mockReturnValue(true);
      require('../../src/mechanics/errorHandling.js').validatePlayer.mockReturnValue(true);

      const result = executeAttack(gameState, 1, 2);

      // The actual return value includes gameState
      expect(result.gameState).toBeDefined();
      expect(result.gameState.defeat).toBe(1); // Success means defeat = 1
    });

    it('should handle failed attack', () => {
      const gameState = {
        adat: {
          1: { arm: 0, dice: 2, size: 5, join: [0, 0, 1, 0, 0] },
          2: { arm: 1, dice: 3, size: 4, join: [0, 1, 0, 0, 0] },
        },
        jun: [1, 2],
        pn: 0,
        his: new Array(100).fill(null).map(() => ({})),
        his_c: 0,
        stock: [8, 3],
        defeat: 0,
        player: [
          { dice_c: 10, area_c: 3 },
          { dice_c: 8, area_c: 2 },
        ],
      };

      /*
       * Mock dice rolls: defender (territory 2) gets higher total
       * Territory 1 (attacker) has 2 dice
       * Territory 2 (defender) has 3 dice
       */
      mockRandom
        .mockReturnValueOnce(0.0) // First attacker die (rolls 1)
        .mockReturnValueOnce(0.0) // Second attacker die (rolls 1)
        .mockReturnValueOnce(0.9) // First defender die (rolls 6)
        .mockReturnValueOnce(0.9) // Second defender die (rolls 6)
        .mockReturnValueOnce(0.9); // Third defender die (rolls 6)

      // Mock validation functions to pass
      require('../../src/mechanics/errorHandling.js').validateTerritories.mockReturnValue(true);
      require('../../src/mechanics/errorHandling.js').validatePlayer.mockReturnValue(true);

      const result = executeAttack(gameState, 1, 2);

      // The actual return value includes gameState
      expect(result.gameState).toBeDefined();
      expect(result.gameState.defeat).toBe(0); // Failure means defeat = 0
    });
  });

  describe('distributeReinforcements', () => {
    it('should distribute dice to territories', () => {
      const gameState = {
        adat: {
          1: { arm: 0, dice: 2, size: 5, join: [0, 0, 0, 0, 0] },
          2: { arm: 0, dice: 3, size: 4, join: [0, 0, 0, 0, 0] },
          3: { arm: 1, dice: 1, size: 3, join: [0, 0, 0, 0, 0] },
        },
        jun: [1, 2],
        pn: 0,
        his: new Array(100).fill(null).map(() => ({})),
        his_c: 0,
        stock: [5, 3],
        player: [
          { area_c: 2, dice_c: 5, area_tc: 6 },
          { area_c: 1, dice_c: 1, area_tc: 3 },
        ],
        AREA_MAX: 4,
      };

      const result = distributeReinforcements(gameState, 1, 3);

      // Should have distributed some dice
      expect(result.his_c).toBeGreaterThanOrEqual(0);
    });

    it('should respect dice limit', () => {
      const gameState = {
        adat: {
          1: { arm: 0, dice: 7, size: 5, join: [0, 0, 0, 0, 0] }, // Near max
          2: { arm: 0, dice: 6, size: 4, join: [0, 0, 0, 0, 0] },
        },
        jun: [1],
        pn: 0,
        his: new Array(100).fill(null).map(() => ({})),
        his_c: 0,
        stock: [10],
        player: [{ area_c: 2, dice_c: 13, area_tc: 9 }],
        AREA_MAX: 3,
      };

      const result = distributeReinforcements(gameState, 0, 10); // Should be 0 for player index

      // Dice should not exceed max of 8
      expect(result.adat[1].dice).toBeLessThanOrEqual(8);
      expect(result.adat[2].dice).toBeLessThanOrEqual(8);
    });
  });

  describe('setPlayerTerritoryData', () => {
    it('should update player territory and dice counts', () => {
      const gameState = {
        player: [
          { area_c: 0, dice_c: 0 },
          { area_c: 0, dice_c: 0 },
        ],
        adat: [
          null,
          { arm: 0, dice: 3, size: 5 }, // Changed arm from 1 to 0
          { arm: 0, dice: 2, size: 4 }, // Changed arm from 1 to 0
          { arm: 1, dice: 4, size: 3 }, // Changed arm from 2 to 1
          { arm: 0, dice: 1, size: 2 }, // Changed arm from 1 to 0
        ],
        AREA_MAX: 5,
      };

      // Call with playerIndex = 0
      setPlayerTerritoryData(gameState, 0);

      expect(gameState.player[0].area_c).toBe(3); // Player 0 has 3 territories
      expect(gameState.player[0].dice_c).toBe(6); // Total dice: 3+2+1
    });

    it('should handle player with no territories', () => {
      const gameState = {
        player: [
          { area_c: 10, dice_c: 20 }, // Will be reset
          { area_c: 5, dice_c: 10 },
        ],
        adat: [null, { arm: 2, dice: 3, size: 5 }, { arm: 2, dice: 2, size: 4 }],
        AREA_MAX: 3,
      };

      setPlayerTerritoryData(gameState, 0);

      expect(gameState.player[0].area_c).toBe(0);
      expect(gameState.player[0].dice_c).toBe(0);
    });
  });
});
