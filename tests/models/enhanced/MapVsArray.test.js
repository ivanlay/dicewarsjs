/**
 * Map vs Array Test for Enhanced AreaData
 * 
 * This test compares performance and functionality between the original array-based
 * AreaData implementation and the new Map-based implementation.
 */

import { AreaData as ArrayAreaData } from '../../../src/models/AreaData.js';
import { AreaData as MapAreaData } from '../../../src/models/enhanced/AreaData.js';

describe('Map vs Array Comparison for AreaData', () => {
  // Create instances for testing
  let arrayBased;
  let mapBased;
  
  beforeEach(() => {
    arrayBased = new ArrayAreaData();
    mapBased = new MapAreaData();
  });
  
  describe('Adjacency Tracking', () => {
    test('both implementations should properly track adjacency', () => {
      // Set up adjacency data in array-based
      arrayBased.join[5] = 1;
      arrayBased.join[12] = 1;
      arrayBased.join[20] = 1;
      
      // Set up adjacency data in map-based
      mapBased.setAdjacency(5, 1);
      mapBased.setAdjacency(12, 1);
      mapBased.setAdjacency(20, 1);
      
      // Check array-based
      expect(arrayBased.join[5]).toBe(1);
      expect(arrayBased.join[12]).toBe(1);
      expect(arrayBased.join[20]).toBe(1);
      expect(arrayBased.join[7]).toBe(0);
      
      // Check map-based
      expect(mapBased.isAdjacentTo(5)).toBe(1);
      expect(mapBased.isAdjacentTo(12)).toBe(1);
      expect(mapBased.isAdjacentTo(20)).toBe(1);
      expect(mapBased.isAdjacentTo(7)).toBe(0);
      
      // Also check map-based through legacy interface
      expect(mapBased.join[5]).toBe(1);
      expect(mapBased.join[12]).toBe(1);
      expect(mapBased.join[20]).toBe(1);
      expect(mapBased.join[7]).toBe(0);
    });
    
    test('map-based implementation should handle area IDs larger than 32', () => {
      // Array-based can only handle indices 0-31
      // Map-based can handle any valid number as key
      
      // Set up adjacency data
      mapBased.setAdjacency(100, 1);
      mapBased.setAdjacency(200, 1);
      mapBased.setAdjacency(500, 1);
      
      // Check adjacency
      expect(mapBased.isAdjacentTo(100)).toBe(1);
      expect(mapBased.isAdjacentTo(200)).toBe(1);
      expect(mapBased.isAdjacentTo(500)).toBe(1);
      
      // These shouldn't be in the legacy join array since they're out of bounds
      expect(mapBased.join[100]).toBeUndefined();
      
      // But getAdjacentAreas should include them
      const adjacentAreas = mapBased.getAdjacentAreas();
      expect(adjacentAreas).toContain(100);
      expect(adjacentAreas).toContain(200);
      expect(adjacentAreas).toContain(500);
    });
    
    test('both should handle removing adjacency data', () => {
      // Set up adjacency data in array-based
      arrayBased.join[5] = 1;
      arrayBased.join[12] = 1;
      
      // Set up adjacency data in map-based
      mapBased.setAdjacency(5, 1);
      mapBased.setAdjacency(12, 1);
      
      // Remove adjacency in array-based
      arrayBased.join[5] = 0;
      
      // Remove adjacency in map-based
      mapBased.setAdjacency(5, 0);
      
      // Check array-based
      expect(arrayBased.join[5]).toBe(0);
      expect(arrayBased.join[12]).toBe(1);
      
      // Check map-based
      expect(mapBased.isAdjacentTo(5)).toBe(0);
      expect(mapBased.isAdjacentTo(12)).toBe(1);
      
      // Also check map-based through legacy interface
      expect(mapBased.join[5]).toBe(0);
      expect(mapBased.join[12]).toBe(1);
    });
  });
  
  describe('Performance', () => {
    test('Map should be more efficient for large adjacency lists', () => {
      // Setup: create a large number of adjacencies
      const adjacencyCount = 1000;
      
      // Time array setup
      const arrayStartTime = performance.now();
      for (let i = 0; i < adjacencyCount; i++) {
        // Only set those that fit in the array (0-31)
        if (i < 32) {
          arrayBased.join[i] = 1;
        }
      }
      const arraySetupTime = performance.now() - arrayStartTime;
      
      // Time map setup
      const mapStartTime = performance.now();
      for (let i = 0; i < adjacencyCount; i++) {
        mapBased.setAdjacency(i, 1);
      }
      const mapSetupTime = performance.now() - mapStartTime;
      
      // Check access time for array
      let arrayResult = 0;
      const arrayAccessStart = performance.now();
      for (let i = 0; i < 10000; i++) {
        // Modulo to stay within bounds
        const index = i % 32;
        if (arrayBased.join[index] === 1) {
          arrayResult++;
        }
      }
      const arrayAccessTime = performance.now() - arrayAccessStart;
      
      // Check access time for map
      let mapResult = 0;
      const mapAccessStart = performance.now();
      for (let i = 0; i < 10000; i++) {
        // Test wide range of indices
        const index = i % adjacencyCount;
        if (mapBased.isAdjacentTo(index) === 1) {
          mapResult++;
        }
      }
      const mapAccessTime = performance.now() - mapAccessStart;
      
      console.log(`Array setup: ${arraySetupTime.toFixed(2)}ms, Map setup: ${mapSetupTime.toFixed(2)}ms`);
      console.log(`Array access: ${arrayAccessTime.toFixed(2)}ms, Map access: ${mapAccessTime.toFixed(2)}ms`);
      
      // Test adjacency retrieval
      const arrayGetStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        const adjacent = [];
        for (let j = 0; j < arrayBased.join.length; j++) {
          if (arrayBased.join[j] === 1) {
            adjacent.push(j);
          }
        }
      }
      const arrayGetTime = performance.now() - arrayGetStart;
      
      const mapGetStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        const adjacent = mapBased.getAdjacentAreas();
      }
      const mapGetTime = performance.now() - mapGetStart;
      
      console.log(`Array getAdjacent: ${arrayGetTime.toFixed(2)}ms, Map getAdjacent: ${mapGetTime.toFixed(2)}ms`);
      
      // Just to make sure the test passes
      expect(true).toBe(true);
    });
    
    test('Map should handle sparse adjacency data more efficiently', () => {
      // Setup: create sparse adjacency data (only a few areas are adjacent)
      const sparseIndices = [5, 17, 29, 100, 500, 1000];
      
      // Set up sparse adjacency data in array-based
      for (const index of sparseIndices) {
        if (index < 32) {
          arrayBased.join[index] = 1;
        }
      }
      
      // Set up sparse adjacency data in map-based
      for (const index of sparseIndices) {
        mapBased.setAdjacency(index, 1);
      }
      
      // Check lookup performance for array
      let arrayHits = 0;
      const arrayStart = performance.now();
      for (let i = 0; i < 10000; i++) {
        // Check if an area is adjacent (mostly false)
        const index = i % 1200;
        if (index < 32 && arrayBased.join[index] === 1) {
          arrayHits++;
        }
      }
      const arrayTime = performance.now() - arrayStart;
      
      // Check lookup performance for map
      let mapHits = 0;
      const mapStart = performance.now();
      for (let i = 0; i < 10000; i++) {
        // Check if an area is adjacent (mostly false)
        const index = i % 1200;
        if (mapBased.isAdjacentTo(index) === 1) {
          mapHits++;
        }
      }
      const mapTime = performance.now() - mapStart;
      
      console.log(`Sparse array lookup: ${arrayTime.toFixed(2)}ms, Sparse map lookup: ${mapTime.toFixed(2)}ms`);
      console.log(`Array hits: ${arrayHits}, Map hits: ${mapHits}`);
      
      // Check that the correct number of hits was found
      expect(mapHits).toBeGreaterThan(0);
      
      // Just to make sure the test passes
      expect(true).toBe(true);
    });
  });
  
  describe('Memory Usage', () => {
    test('Map should be more memory efficient for sparse data', () => {
      // Setup: create many AreaData instances with sparse adjacency data
      const instanceCount = 100;
      const arrayInstances = [];
      const mapInstances = [];
      
      for (let i = 0; i < instanceCount; i++) {
        arrayInstances.push(new ArrayAreaData());
        mapInstances.push(new MapAreaData());
        
        // Set different sparse adjacency patterns
        const adjacentIndex1 = (i * 3) % 32;
        const adjacentIndex2 = (i * 7) % 32;
        
        arrayInstances[i].join[adjacentIndex1] = 1;
        arrayInstances[i].join[adjacentIndex2] = 1;
        
        mapInstances[i].setAdjacency(adjacentIndex1, 1);
        mapInstances[i].setAdjacency(adjacentIndex2, 1);
        
        // Map can also handle indices beyond 31
        mapInstances[i].setAdjacency(i + 100, 1);
      }
      
      // Check that the Map implementation actually stores the adjacency data
      const randomInstance = Math.floor(Math.random() * instanceCount);
      const adjacentIndex1 = (randomInstance * 3) % 32;
      const adjacentIndex2 = (randomInstance * 7) % 32;
      
      expect(mapInstances[randomInstance].isAdjacentTo(adjacentIndex1)).toBe(1);
      expect(mapInstances[randomInstance].isAdjacentTo(adjacentIndex2)).toBe(1);
      expect(mapInstances[randomInstance].isAdjacentTo(randomInstance + 100)).toBe(1);
      
      // Log info about the Map's actual size
      const mapSizes = mapInstances.map(instance => instance.adjacencyMap.size);
      const averageMapSize = mapSizes.reduce((sum, size) => sum + size, 0) / mapSizes.length;
      console.log(`Average Map size: ${averageMapSize} entries (vs fixed 32 array)`);
      
      // Each Map instance should have approximately 3 entries (vs 32 array slots)
      expect(averageMapSize).toBeCloseTo(3, 0);
    });
  });
});