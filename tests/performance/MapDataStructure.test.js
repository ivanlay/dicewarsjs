/**
 * Performance Tests for Map-based AreaData vs Array-based AreaData
 *
 * This file contains tests to measure the performance improvements from using
 * ES6 Map objects instead of arrays for territory adjacency tracking.
 */

import { AreaData as ArrayAreaData } from '../../src/models/AreaData.js';
import { AreaData as MapAreaData } from '../../src/models/enhanced/AreaData.js';

describe('AreaData Performance Comparison', () => {
  // Helper function to measure execution time
  const measureTime = fn => {
    const start = performance.now();
    fn();
    return performance.now() - start;
  };

  // Helper function to create territory with random adjacencies
  const createTerritoryWithRandomAdjacencies = (AreaDataClass, count, maxAreaId) => {
    const area = new AreaDataClass();
    const adjacentIds = new Set();

    // Generate random adjacency IDs
    for (let i = 0; i < count; i++) {
      adjacentIds.add(Math.floor(Math.random() * maxAreaId) + 1);
    }

    // Set adjacencies
    if (area instanceof MapAreaData) {
      // Use Map-based methods
      adjacentIds.forEach(id => area.setAdjacency(id, 1));
    } else {
      // Use Array-based methods
      adjacentIds.forEach(id => (area.join[id] = 1));
    }

    return { area, adjacentIds: Array.from(adjacentIds) };
  };

  test('Comparison: Setting adjacency', () => {
    // Number of operations to perform
    const iterations = 10000;
    const maxAreaId = 100;

    // Test Array-based AreaData
    const arrayAreaData = new ArrayAreaData();
    const arrayTime = measureTime(() => {
      for (let i = 0; i < iterations; i++) {
        const areaId = (i % maxAreaId) + 1;
        arrayAreaData.join[areaId] = 1;
      }
    });

    // Test Map-based AreaData
    const mapAreaData = new MapAreaData();
    const mapTime = measureTime(() => {
      for (let i = 0; i < iterations; i++) {
        const areaId = (i % maxAreaId) + 1;
        mapAreaData.setAdjacency(areaId, 1);
      }
    });

    console.log(
      `Setting adjacency - Array: ${arrayTime.toFixed(2)}ms, Map: ${mapTime.toFixed(2)}ms`
    );
    expect(mapAreaData.getAdjacentAreas().length).toBe(maxAreaId);
  });

  test('Comparison: Checking adjacency', () => {
    // Number of operations to perform
    const iterations = 100000;
    const maxAreaId = 500;

    // Create territories with some adjacent areas
    const { area: arrayAreaData, adjacentIds } = createTerritoryWithRandomAdjacencies(
      ArrayAreaData,
      50,
      maxAreaId
    );
    const { area: mapAreaData } = createTerritoryWithRandomAdjacencies(MapAreaData, 50, maxAreaId);

    // Ensure both have the same adjacencies
    adjacentIds.forEach(id => mapAreaData.setAdjacency(id, 1));

    // Test Array-based lookup
    const arrayTime = measureTime(() => {
      let found = 0;
      for (let i = 0; i < iterations; i++) {
        const areaId = (i % maxAreaId) + 1;
        if (arrayAreaData.join[areaId] === 1) {
          found++;
        }
      }
    });

    // Test Map-based lookup
    const mapTime = measureTime(() => {
      let found = 0;
      for (let i = 0; i < iterations; i++) {
        const areaId = (i % maxAreaId) + 1;
        if (mapAreaData.isAdjacentTo(areaId) === 1) {
          found++;
        }
      }
    });

    console.log(
      `Checking adjacency - Array: ${arrayTime.toFixed(2)}ms, Map: ${mapTime.toFixed(2)}ms`
    );
  });

  test('Comparison: Finding all adjacent areas', () => {
    // Number of operations to perform
    const iterations = 10000;
    const maxAreaId = 1000;

    // Create territories with many adjacent areas
    const { area: arrayAreaData, adjacentIds } = createTerritoryWithRandomAdjacencies(
      ArrayAreaData,
      200,
      maxAreaId
    );
    const { area: mapAreaData } = createTerritoryWithRandomAdjacencies(MapAreaData, 200, maxAreaId);

    // Ensure both have the same adjacencies
    adjacentIds.forEach(id => mapAreaData.setAdjacency(id, 1));

    // Test Array-based finding
    const arrayTime = measureTime(() => {
      for (let i = 0; i < iterations; i++) {
        const adjacentAreas = [];
        for (let j = 0; j < arrayAreaData.join.length; j++) {
          if (arrayAreaData.join[j] === 1) {
            adjacentAreas.push(j);
          }
        }
      }
    });

    // Test Map-based finding
    const mapTime = measureTime(() => {
      for (let i = 0; i < iterations; i++) {
        const adjacentAreas = mapAreaData.getAdjacentAreas();
      }
    });

    console.log(
      `Finding adjacent areas - Array: ${arrayTime.toFixed(2)}ms, Map: ${mapTime.toFixed(2)}ms`
    );
  });

  test('Comparison: Memory usage with large number of areas', () => {
    // Number of territories to create
    const areaCount = 1000;
    const adjacencyPercentage = 0.05; // 5% of areas are adjacent

    // Create array areas
    const arrayAreas = [];
    for (let i = 0; i < areaCount; i++) {
      arrayAreas.push(new ArrayAreaData());
    }

    // Set random adjacencies in array areas
    for (let i = 0; i < areaCount; i++) {
      for (let j = 0; j < areaCount; j++) {
        if (i !== j && Math.random() < adjacencyPercentage) {
          if (j < 32) {
            // Array has fixed size of 32
            arrayAreas[i].join[j] = 1;
          }
        }
      }
    }

    // Create map areas
    const mapAreas = [];
    for (let i = 0; i < areaCount; i++) {
      mapAreas.push(new MapAreaData());
    }

    // Set random adjacencies in map areas
    for (let i = 0; i < areaCount; i++) {
      for (let j = 0; j < areaCount; j++) {
        if (i !== j && Math.random() < adjacencyPercentage) {
          mapAreas[i].setAdjacency(j, 1);
        }
      }
    }

    // Count average adjacencies per area
    let arrayAdjacenciesTotal = 0;
    for (const area of arrayAreas) {
      for (let i = 0; i < area.join.length; i++) {
        if (area.join[i] === 1) {
          arrayAdjacenciesTotal++;
        }
      }
    }

    let mapAdjacenciesTotal = 0;
    for (const area of mapAreas) {
      mapAdjacenciesTotal += area.adjacencyMap.size;
    }

    const arrayAdjacenciesAvg = arrayAdjacenciesTotal / areaCount;
    const mapAdjacenciesAvg = mapAdjacenciesTotal / areaCount;

    console.log(
      `Average adjacencies - Array: ${arrayAdjacenciesAvg.toFixed(2)}, Map: ${mapAdjacenciesAvg.toFixed(2)}`
    );

    // Test access performance on the created areas
    const iterations = 100000;

    // Array access test
    const arrayAccessTime = measureTime(() => {
      for (let i = 0; i < iterations; i++) {
        const areaIndex = i % areaCount;
        const adjacentIndex = i % 32;
        const isAdjacent = arrayAreas[areaIndex].join[adjacentIndex] === 1;
      }
    });

    // Map access test
    const mapAccessTime = measureTime(() => {
      for (let i = 0; i < iterations; i++) {
        const areaIndex = i % areaCount;
        const adjacentIndex = i % areaCount;
        const isAdjacent = mapAreas[areaIndex].isAdjacentTo(adjacentIndex) === 1;
      }
    });

    console.log(
      `Large-scale access - Array: ${arrayAccessTime.toFixed(2)}ms, Map: ${mapAccessTime.toFixed(2)}ms`
    );

    // This test doesn't assert anything specific, just logs performance metrics
    expect(true).toBeTruthy();
  });
});
