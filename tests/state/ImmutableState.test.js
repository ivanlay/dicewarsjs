/**
 * Immutable State Tests
 *
 * These tests verify the functionality and performance of immutable state management.
 */

import {
  GameState,
  TerritoryState,
  PlayerState,
  updateObject,
  deepFreeze,
  immutable,
} from '../../src/state/index.js';

import { AreaData } from '../../src/models/enhanced/AreaData.js';
import { PlayerData } from '../../src/models/enhanced/PlayerData.js';

// Utility function to measure performance
const measurePerformance = (fn, iterations = 1000) => {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    fn(i);
  }

  const end = performance.now();
  return end - start;
};

describe('Immutable State Management', () => {
  describe('Basic Immutability', () => {
    test('Objects cannot be modified after freezing', () => {
      const obj = deepFreeze({ a: 1, b: 2 });

      // This should throw an error in strict mode
      expect(() => {
        obj.a = 3;
      }).toThrow();

      // Object should remain unchanged
      expect(obj.a).toBe(1);
    });

    test('updateObject creates a new object', () => {
      const original = { a: 1, b: 2 };
      const updated = updateObject(original, { b: 3, c: 4 });

      // Original should be unchanged
      expect(original.b).toBe(2);
      expect(original.c).toBeUndefined();

      // Updated should have new values
      expect(updated.b).toBe(3);
      expect(updated.c).toBe(4);

      // Not the same object reference
      expect(updated).not.toBe(original);
    });

    test('Nested objects are handled by immutable', () => {
      const original = {
        a: 1,
        b: {
          c: 2,
          d: [3, 4, 5],
        },
      };

      const frozen = immutable(original);

      // Should freeze the top level
      expect(Object.isFrozen(frozen)).toBe(true);

      // Should freeze nested objects
      expect(Object.isFrozen(frozen.b)).toBe(true);

      // Should freeze arrays
      expect(Object.isFrozen(frozen.b.d)).toBe(true);

      // Attempting modifications should fail
      expect(() => {
        frozen.b.c = 10;
      }).toThrow();

      expect(() => {
        frozen.b.d.push(6);
      }).toThrow();
    });
  });

  describe('TerritoryState', () => {
    test('Territory creation is immutable', () => {
      const territory = TerritoryState.create(1, {
        owner: 2,
        diceCount: 3,
      });

      expect(territory.id).toBe(1);
      expect(territory.owner).toBe(2);
      expect(territory.diceCount).toBe(3);

      // Should be frozen
      expect(Object.isFrozen(territory)).toBe(true);

      // Collections should also be frozen
      expect(Object.isFrozen(territory.cells)).toBe(true);
      expect(Object.isFrozen(territory.adjacentTerritories)).toBe(true);
    });

    test('Territory updates return new objects', () => {
      const territory = TerritoryState.create(1, { owner: 2, diceCount: 3 });
      const updated = TerritoryState.update(territory, { diceCount: 5 });

      // Original should be unchanged
      expect(territory.diceCount).toBe(3);

      // Updated should have new value
      expect(updated.diceCount).toBe(5);

      // Not the same object reference
      expect(updated).not.toBe(territory);

      // Other properties should remain the same
      expect(updated.owner).toBe(territory.owner);
    });

    test('Territory adjacency operations', () => {
      let territory = TerritoryState.create(1);

      // Add adjacency
      territory = TerritoryState.addAdjacent(territory, 2);
      territory = TerritoryState.addAdjacent(territory, 3);

      // Check adjacency
      expect(TerritoryState.isAdjacentTo(territory, 2)).toBe(true);
      expect(TerritoryState.isAdjacentTo(territory, 3)).toBe(true);
      expect(TerritoryState.isAdjacentTo(territory, 4)).toBe(false);

      // Get all adjacencies
      expect(TerritoryState.getAdjacentIds(territory)).toEqual([2, 3]);

      // Remove adjacency
      territory = TerritoryState.removeAdjacent(territory, 2);

      // Check adjacency again
      expect(TerritoryState.isAdjacentTo(territory, 2)).toBe(false);
      expect(TerritoryState.isAdjacentTo(territory, 3)).toBe(true);
    });
  });

  describe('PlayerState', () => {
    test('Player creation is immutable', () => {
      const player = PlayerState.create(1, {
        isHuman: true,
        territoryCount: 5,
      });

      expect(player.id).toBe(1);
      expect(player.isHuman).toBe(true);
      expect(player.territoryCount).toBe(5);

      // Should be frozen
      expect(Object.isFrozen(player)).toBe(true);
    });

    test('Player updates return new objects', () => {
      const player = PlayerState.create(1, { territoryCount: 5 });
      const updated = PlayerState.update(player, { territoryCount: 7 });

      // Original should be unchanged
      expect(player.territoryCount).toBe(5);

      // Updated should have new value
      expect(updated.territoryCount).toBe(7);

      // Not the same object reference
      expect(updated).not.toBe(player);
    });

    test('Territory count operations', () => {
      let player = PlayerState.create(1, { territoryCount: 5 });

      // Add territories
      player = PlayerState.addTerritories(player, 3);
      expect(player.territoryCount).toBe(8);

      // Remove territories
      player = PlayerState.removeTerritories(player, 2);
      expect(player.territoryCount).toBe(6);

      // Remove all territories should mark player as eliminated
      player = PlayerState.removeTerritories(player, 10);
      expect(player.territoryCount).toBe(0);
      expect(player.eliminated).toBe(true);
    });

    test('Reserve dice operations', () => {
      let player = PlayerState.create(1, { reserveDice: 5 });

      // Add reserve dice
      player = PlayerState.addReserveDice(player, 3);
      expect(player.reserveDice).toBe(8);

      // Use reserve dice
      player = PlayerState.useReserveDice(player, 2);
      expect(player.reserveDice).toBe(6);

      // Using more dice than available should set to 0
      player = PlayerState.useReserveDice(player, 10);
      expect(player.reserveDice).toBe(0);
    });
  });

  describe('GameState', () => {
    test('Initial state creation', () => {
      const gameState = new GameState();
      const state = gameState.getState();

      // Should have all required properties
      expect(state.config).toBeDefined();
      expect(state.grid).toBeDefined();
      expect(state.territories).toBeDefined();
      expect(state.players).toBeDefined();
      expect(state.currentTurn).toBeDefined();

      // Should be frozen
      expect(Object.isFrozen(state)).toBe(true);
      expect(Object.isFrozen(state.config)).toBe(true);
      expect(Object.isFrozen(state.players)).toBe(true);
    });

    test('State updates return new state', () => {
      const gameState = new GameState();
      const originalState = gameState.getState();

      // Update a top-level property
      const newState = gameState.updateState({
        config: { ...originalState.config, playerCount: 4 },
      });

      // Original state should be in history but unchanged
      expect(gameState.getStateHistory()[0].state).toBe(originalState);
      expect(originalState.config.playerCount).toBe(7); // Default

      // New state should have updated value
      expect(newState.config.playerCount).toBe(4);

      // Not the same state reference
      expect(newState).not.toBe(originalState);
    });

    test('Territory updates', () => {
      // Create game state with a test territory
      const gameState = new GameState();
      let state = gameState.getState();

      // Add a test territory to the state
      const territory = TerritoryState.create(1, { owner: 2, diceCount: 3 });
      const territories = new Map([[1, territory]]);
      state = gameState.updateState({ territories });

      // Update the territory
      state = gameState.updateTerritory(1, { diceCount: 5 });

      // Check the update was applied
      expect(state.territories.get(1).diceCount).toBe(5);
      expect(state.territories.get(1).owner).toBe(2); // Unchanged
    });

    test('Player updates', () => {
      const gameState = new GameState();
      let state = gameState.getState();

      // Update a player
      state = gameState.updatePlayer(1, { territoryCount: 10 });

      // Check the update was applied
      expect(state.players[1].territoryCount).toBe(10);
    });

    test('Turn management', () => {
      const gameState = new GameState();
      let state = gameState.getState();

      // Update turn state
      state = gameState.updateTurn({ currentPlayerIndex: 2 });
      expect(state.currentTurn.currentPlayerIndex).toBe(2);

      // Advance to next player
      state = gameState.nextPlayerTurn();
      expect(state.currentTurn.currentPlayerIndex).toBe(3);

      // History should be tracking states
      expect(gameState.getStateHistory().length).toBe(3);
    });
  });

  describe('Performance Comparison', () => {
    test('Mutable vs Immutable Objects - Small Updates', () => {
      // Prepare test objects
      const mutableObj = { a: 1, b: 2, c: 3, d: 4 };
      let immutableObj = immutable({ a: 1, b: 2, c: 3, d: 4 });

      // Test mutable updates
      const mutableTime = measurePerformance(i => {
        mutableObj.a = i;
        mutableObj.b = i * 2;
        return mutableObj;
      });

      // Test immutable updates
      const immutableTime = measurePerformance(i => {
        immutableObj = updateObject(immutableObj, {
          a: i,
          b: i * 2,
        });
        return immutableObj;
      });

      console.log(`Small Object Updates:
- Mutable: ${mutableTime.toFixed(2)}ms
- Immutable: ${immutableTime.toFixed(2)}ms
- Ratio: ${(immutableTime / mutableTime).toFixed(2)}x`);

      // Mutable should be faster, but we're measuring the overhead
      expect(immutableTime).toBeGreaterThan(mutableTime);
    });

    test('Mutable vs Immutable Area State - Property Updates', () => {
      // Prepare test objects
      const mutableArea = new AreaData();
      mutableArea.dice = 3;
      mutableArea.arm = 1;

      let immutableArea = TerritoryState.create(1, {
        diceCount: 3,
        owner: 1,
      });

      // Test mutable updates
      const mutableTime = measurePerformance(i => {
        mutableArea.dice = (mutableArea.dice + 1) % 8;
        mutableArea.arm = (mutableArea.arm + 1) % 4;
        return mutableArea;
      });

      // Test immutable updates
      const immutableTime = measurePerformance(i => {
        immutableArea = TerritoryState.update(immutableArea, {
          diceCount: (immutableArea.diceCount + 1) % 8,
          owner: (immutableArea.owner + 1) % 4,
        });
        return immutableArea;
      });

      console.log(`Territory Property Updates:
- Mutable: ${mutableTime.toFixed(2)}ms
- Immutable: ${immutableTime.toFixed(2)}ms
- Ratio: ${(immutableTime / mutableTime).toFixed(2)}x`);
    });

    test('Mutable vs Immutable Player State - Property Updates', () => {
      // Prepare test objects
      const mutablePlayer = new PlayerData();
      mutablePlayer.area_c = 5;
      mutablePlayer.dice_c = 10;

      let immutablePlayer = PlayerState.create(1, {
        territoryCount: 5,
        diceCount: 10,
      });

      // Test mutable updates
      const mutableTime = measurePerformance(i => {
        mutablePlayer.area_c += 1;
        mutablePlayer.dice_c += 2;
        return mutablePlayer;
      });

      // Test immutable updates
      const immutableTime = measurePerformance(i => {
        immutablePlayer = PlayerState.update(immutablePlayer, {
          territoryCount: immutablePlayer.territoryCount + 1,
          diceCount: immutablePlayer.diceCount + 2,
        });
        return immutablePlayer;
      });

      console.log(`Player Property Updates:
- Mutable: ${mutableTime.toFixed(2)}ms
- Immutable: ${immutableTime.toFixed(2)}ms
- Ratio: ${(immutableTime / mutableTime).toFixed(2)}x`);
    });

    test('State Manager vs Direct Updates', () => {
      // Prepare test objects
      const gameState = new GameState();

      // Directly manipulate objects with state manager
      const withManagerTime = measurePerformance(i => {
        gameState.updateTurn({ attackCount: i % 10 });
        return gameState.getState();
      });

      // Direct manipulation without state management
      let directState = { currentTurn: { attackCount: 0 } };
      const directUpdateTime = measurePerformance(i => {
        directState = {
          ...directState, 
          currentTurn: {
            ...directState.currentTurn,
            attackCount: i % 10,
          },
        };
        return directState;
      });

      console.log(`State Updates:
- With State Manager: ${withManagerTime.toFixed(2)}ms
- Direct Updates: ${directUpdateTime.toFixed(2)}ms
- Ratio: ${(withManagerTime / directUpdateTime).toFixed(2)}x`);
    });
  });
});
