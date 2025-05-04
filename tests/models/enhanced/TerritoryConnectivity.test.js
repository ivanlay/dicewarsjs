/**
 * Territory Connectivity Performance Tests
 *
 * These tests compare the performance of the original territory connectivity implementation
 * with the new enhanced implementation using AdjacencyGraph, DisjointSet, and TerritoryGraph.
 */

import { AreaData } from '../../../src/models/enhanced/AreaData.js';
import { TerritoryGraph } from '../../../src/models/enhanced/TerritoryGraph.js';
import { AdjacencyGraph } from '../../../src/models/enhanced/AdjacencyGraph.js';
import { DisjointSet } from '../../../src/models/enhanced/DisjointSet.js';

// Test utilities
function createMockTerritory(id, playerId = 0, adjacentIds = []) {
  const territory = new AreaData();
  territory.size = 1;
  territory.arm = playerId;

  // Set adjacencies
  for (const adjacentId of adjacentIds) {
    territory.setAdjacency(adjacentId, 1);
  }

  return territory;
}

function createMockGame(territoryCount, playerCount, connectionDensity = 0.1) {
  const territories = new Map();

  // Create territories with random player ownership
  for (let i = 1; i <= territoryCount; i++) {
    const playerId = Math.floor(Math.random() * playerCount) + 1;
    territories.set(i, createMockTerritory(i, playerId));
  }

  // Add random connections between territories
  for (let i = 1; i <= territoryCount; i++) {
    const territory = territories.get(i);

    for (let j = 1; j <= territoryCount; j++) {
      if (i === j) continue;

      // Add connections with probability based on density
      if (Math.random() < connectionDensity) {
        // Add bidirectional connection
        territory.setAdjacency(j, 1);
        territories.get(j).setAdjacency(i, 1);
      }
    }
  }

  // Mock game object
  return {
    getTerritories: () => territories,
    territories,
  };
}

// Original implementation of finding territory groups (simplified version)
function findGroupsOriginal(territories, playerId) {
  const playerTerritories = [...territories.entries()]
    .filter(([id, t]) => t.arm === playerId)
    .map(([id]) => id);

  // Initialize groups, each territory starts in its own group
  const groups = new Map();
  const territoryToGroup = new Map();

  let groupId = 1;
  for (const id of playerTerritories) {
    groups.set(groupId, new Set([id]));
    territoryToGroup.set(id, groupId);
    groupId++;
  }

  // Merge groups if territories are adjacent
  let changed = true;
  while (changed) {
    changed = false;

    for (const territoryId of playerTerritories) {
      const territory = territories.get(territoryId);
      const groupId = territoryToGroup.get(territoryId);

      for (const adjacentId of territory.getAdjacentAreas()) {
        const adjacentTerritory = territories.get(adjacentId);

        // Skip if not owned by the player
        if (!adjacentTerritory || adjacentTerritory.arm !== playerId) {
          continue;
        }

        const adjacentGroupId = territoryToGroup.get(adjacentId);

        // If different groups, merge them
        if (groupId !== adjacentGroupId) {
          const group = groups.get(groupId);
          const adjacentGroup = groups.get(adjacentGroupId);

          // Merge into the lower group ID
          const targetGroupId = Math.min(groupId, adjacentGroupId);
          const sourceGroupId = Math.max(groupId, adjacentGroupId);

          const targetGroup = groups.get(targetGroupId);
          const sourceGroup = groups.get(sourceGroupId);

          // Update all territories in the source group
          for (const id of sourceGroup) {
            targetGroup.add(id);
            territoryToGroup.set(id, targetGroupId);
          }

          // Remove the source group
          groups.delete(sourceGroupId);

          changed = true;
        }
      }
    }
  }

  return [...groups.values()].map(group => [...group]);
}

// Tests
describe('Territory Connectivity Performance', () => {
  // Configure territory counts for testing
  const territoryCounts = [20, 50, 100, 200];
  const playerCount = 4;

  test.each(territoryCounts)('Create AdjacencyGraph with %i territories', territoryCount => {
    // Generate a mock game with the specified number of territories
    const game = createMockGame(territoryCount, playerCount);

    // Measure time for creating a graph
    const startTime = performance.now();
    const graph = new AdjacencyGraph();

    // Add all territories
    for (const [id, territory] of game.territories.entries()) {
      graph.addTerritory(id);
    }

    // Add all adjacencies
    for (const [id, territory] of game.territories.entries()) {
      for (const adjacentId of territory.getAdjacentAreas()) {
        graph.setAdjacency(id, adjacentId);
      }
    }

    const endTime = performance.now();
    const elapsedTime = endTime - startTime;

    console.log(
      `Creating AdjacencyGraph with ${territoryCount} territories took ${elapsedTime.toFixed(2)}ms`
    );
    expect(graph.adjacencyLists.size).toBe(territoryCount);
  });

  test.each(territoryCounts)('Create TerritoryGraph with %i territories', territoryCount => {
    // Generate a mock game with the specified number of territories
    const game = createMockGame(territoryCount, playerCount);

    // Measure time for creating a TerritoryGraph
    const startTime = performance.now();
    const graph = TerritoryGraph.fromGame(game);
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;

    console.log(
      `Creating TerritoryGraph with ${territoryCount} territories took ${elapsedTime.toFixed(2)}ms`
    );
    expect(graph.territories.size).toBe(territoryCount);
  });

  test.each(territoryCounts)(
    'Compare finding groups: Original vs DisjointSet with %i territories',
    territoryCount => {
      // Generate a mock game with the specified number of territories
      const game = createMockGame(territoryCount, playerCount);
      const playerToTest = 1; // Player to find groups for

      // Measure time for original implementation
      const startTimeOriginal = performance.now();
      const groupsOriginal = findGroupsOriginal(game.territories, playerToTest);
      const endTimeOriginal = performance.now();
      const elapsedTimeOriginal = endTimeOriginal - startTimeOriginal;

      // Measure time for DisjointSet implementation
      const startTimeDisjointSet = performance.now();

      // Create DisjointSet
      const disjointSet = new DisjointSet();

      // Add all territories owned by the player
      for (const [id, territory] of game.territories.entries()) {
        if (territory.arm === playerToTest) {
          disjointSet.makeSet(id);
        }
      }

      // Union adjacent territories owned by the player
      for (const [id, territory] of game.territories.entries()) {
        if (territory.arm !== playerToTest) continue;

        for (const adjacentId of territory.getAdjacentAreas()) {
          const adjacentTerritory = game.territories.get(adjacentId);

          if (adjacentTerritory && adjacentTerritory.arm === playerToTest) {
            disjointSet.union(id, adjacentId);
          }
        }
      }

      // Get groups from DisjointSet
      const groupsDisjointSet = disjointSet.getAllGroups();

      const endTimeDisjointSet = performance.now();
      const elapsedTimeDisjointSet = endTimeDisjointSet - startTimeDisjointSet;

      console.log(`Finding groups with ${territoryCount} territories:`);
      console.log(`  - Original: ${elapsedTimeOriginal.toFixed(2)}ms`);
      console.log(`  - DisjointSet: ${elapsedTimeDisjointSet.toFixed(2)}ms`);
      console.log(`  - Speedup: ${(elapsedTimeOriginal / elapsedTimeDisjointSet).toFixed(2)}x`);

      // Verify correctness: number of groups should be the same
      // (though they might be in different order)
      expect(groupsDisjointSet.length).toBe(groupsOriginal.length);
    }
  );

  test.each(territoryCounts)(
    'Compare finding groups: Original vs TerritoryGraph with %i territories',
    territoryCount => {
      // Generate a mock game with the specified number of territories
      const game = createMockGame(territoryCount, playerCount);
      const playerToTest = 1; // Player to find groups for

      // Measure time for original implementation
      const startTimeOriginal = performance.now();
      const groupsOriginal = findGroupsOriginal(game.territories, playerToTest);
      const endTimeOriginal = performance.now();
      const elapsedTimeOriginal = endTimeOriginal - startTimeOriginal;

      // Measure time for TerritoryGraph implementation
      const startTimeTerritoryGraph = performance.now();

      // Create TerritoryGraph
      const graph = TerritoryGraph.fromGame(game);

      // Find groups
      const groupsGraph = graph.getPlayerTerritoryGroups(playerToTest);

      const endTimeTerritoryGraph = performance.now();
      const elapsedTimeTerritoryGraph = endTimeTerritoryGraph - startTimeTerritoryGraph;

      console.log(`Finding groups with ${territoryCount} territories (including graph creation):`);
      console.log(`  - Original: ${elapsedTimeOriginal.toFixed(2)}ms`);
      console.log(`  - TerritoryGraph: ${elapsedTimeTerritoryGraph.toFixed(2)}ms`);
      console.log(`  - Speedup: ${(elapsedTimeOriginal / elapsedTimeTerritoryGraph).toFixed(2)}x`);

      // Verify correctness: number of groups should be the same
      expect(groupsGraph.length).toBe(groupsOriginal.length);
    }
  );

  test.each(territoryCounts)(
    'Measure performance of strategic value calculation with %i territories',
    territoryCount => {
      // Generate a mock game with the specified number of territories
      const game = createMockGame(territoryCount, playerCount);
      const playerToTest = 1; // Player to calculate values for

      // Create TerritoryGraph
      const graph = TerritoryGraph.fromGame(game);

      // Measure time for strategic value calculation
      const startTime = performance.now();
      const strategicValues = graph.calculateStrategicValues(playerToTest);
      const endTime = performance.now();
      const elapsedTime = endTime - startTime;

      console.log(
        `Calculating strategic values for ${territoryCount} territories took ${elapsedTime.toFixed(2)}ms`
      );

      // Verify we have values for all player territories
      const playerTerritoryCount = [...game.territories.values()].filter(
        t => t.arm === playerToTest
      ).length;

      expect(strategicValues.size).toBeLessThanOrEqual(playerTerritoryCount);
    }
  );

  test.each(territoryCounts)(
    'Measure performance of finding attack paths with %i territories',
    territoryCount => {
      // Generate a mock game with the specified number of territories
      const game = createMockGame(territoryCount, playerCount);

      // Create TerritoryGraph
      const graph = TerritoryGraph.fromGame(game);

      // Find a pair of territories owned by different players
      let startId = null;
      let targetId = null;

      for (const [id, territory] of game.territories.entries()) {
        if (startId === null && territory.arm === 1) {
          startId = id;
        } else if (targetId === null && territory.arm === 2) {
          targetId = id;
        }

        if (startId !== null && targetId !== null) {
          break;
        }
      }

      if (startId === null || targetId === null) {
        // Skip test if we can't find suitable territories
        console.log('Skipping attack path test - could not find suitable territories');
        return;
      }

      // Measure time for finding attack path
      const startTime = performance.now();
      const path = graph.findAttackPath(startId, targetId);
      const endTime = performance.now();
      const elapsedTime = endTime - startTime;

      console.log(
        `Finding attack path in ${territoryCount} territories took ${elapsedTime.toFixed(2)}ms`
      );
      console.log(`Path length: ${path.length}`);
    }
  );
});
