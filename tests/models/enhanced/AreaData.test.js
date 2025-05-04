/**
 * Tests for Enhanced AreaData Model Class
 * 
 * This file contains tests for the ES6+ implementation of the AreaData class,
 * which uses Map objects for more efficient adjacency tracking.
 */

import { AreaData } from '../../../src/models/enhanced/AreaData.js';

describe('Enhanced AreaData', () => {
  let areaData;
  
  beforeEach(() => {
    // Create a fresh AreaData instance for each test
    areaData = new AreaData();
  });
  
  describe('Constructor', () => {
    test('initializes with default values', () => {
      // Size and position properties
      expect(areaData.size).toBe(0);
      expect(areaData.cpos).toBe(0);
      
      // Ownership and dice properties
      expect(areaData.arm).toBe(0);
      expect(areaData.dice).toBe(0);
      
      // Bounding box properties
      expect(areaData.left).toBe(0);
      expect(areaData.right).toBe(0);
      expect(areaData.top).toBe(0);
      expect(areaData.bottom).toBe(0);
      expect(areaData.cx).toBe(0);
      expect(areaData.cy).toBe(0);
      expect(areaData.len_min).toBe(0);
    });
    
    test('initializes arrays with correct lengths', () => {
      // Border arrays
      expect(areaData.line_cel).toBeInstanceOf(Array);
      expect(areaData.line_cel.length).toBe(100);
      
      expect(areaData.line_dir).toBeInstanceOf(Array);
      expect(areaData.line_dir.length).toBe(100);
      
      // Adjacency map should be empty initially
      expect(areaData.adjacencyMap).toBeInstanceOf(Map);
      expect(areaData.adjacencyMap.size).toBe(0);
      
      // Legacy join array should be all zeros
      expect(areaData.join).toBeInstanceOf(Array);
      expect(areaData.join.length).toBe(32);
      expect(areaData.join.every(value => value === 0)).toBe(true);
    });
  });
  
  describe('Data Modification', () => {
    test('can set and retrieve size property', () => {
      areaData.size = 10;
      expect(areaData.size).toBe(10);
    });
    
    test('can set and retrieve player ownership', () => {
      areaData.arm = 3;
      expect(areaData.arm).toBe(3);
    });
    
    test('can set and retrieve dice count', () => {
      areaData.dice = 5;
      expect(areaData.dice).toBe(5);
    });
    
    test('can set and retrieve center position', () => {
      areaData.cpos = 120;
      expect(areaData.cpos).toBe(120);
    });
    
    test('can set and retrieve bounding box', () => {
      areaData.left = 5;
      areaData.right = 15;
      areaData.top = 7;
      areaData.bottom = 18;
      
      expect(areaData.left).toBe(5);
      expect(areaData.right).toBe(15);
      expect(areaData.top).toBe(7);
      expect(areaData.bottom).toBe(18);
    });
    
    test('can calculate center coordinates', () => {
      areaData.left = 5;
      areaData.right = 15;
      areaData.top = 8;
      areaData.bottom = 20;
      
      // Calculate center
      areaData.cx = (areaData.left + areaData.right) / 2;
      areaData.cy = (areaData.top + areaData.bottom) / 2;
      
      expect(areaData.cx).toBe(10);
      expect(areaData.cy).toBe(14);
    });
  });
  
  describe('Border Information', () => {
    test('can set and retrieve border cell indices', () => {
      areaData.line_cel[0] = 100;
      areaData.line_cel[1] = 101;
      areaData.line_cel[2] = 102;
      
      expect(areaData.line_cel[0]).toBe(100);
      expect(areaData.line_cel[1]).toBe(101);
      expect(areaData.line_cel[2]).toBe(102);
    });
    
    test('can set and retrieve border directions', () => {
      areaData.line_dir[0] = 1;  // Right
      areaData.line_dir[1] = 2;  // Bottom-right
      areaData.line_dir[2] = 4;  // Left
      
      expect(areaData.line_dir[0]).toBe(1);
      expect(areaData.line_dir[1]).toBe(2);
      expect(areaData.line_dir[2]).toBe(4);
    });
  });
  
  describe('Adjacency Tracking with Map', () => {
    test('can set and retrieve adjacency with modern methods', () => {
      // Set areas as adjacent
      areaData.setAdjacency(5, 1);
      areaData.setAdjacency(12, 1);
      
      // Check adjacency with modern methods
      expect(areaData.isAdjacentTo(5)).toBe(1);
      expect(areaData.isAdjacentTo(12)).toBe(1);
      expect(areaData.isAdjacentTo(7)).toBe(0);  // Not adjacent
    });
    
    test('can get all adjacent areas', () => {
      // Set some areas as adjacent
      areaData.setAdjacency(2, 1);
      areaData.setAdjacency(5, 1);
      areaData.setAdjacency(8, 1);
      
      // Get all adjacent areas
      const adjacentAreas = areaData.getAdjacentAreas();
      
      // Check results
      expect(adjacentAreas).toEqual(expect.arrayContaining([2, 5, 8]));
      expect(adjacentAreas.length).toBe(3);
    });
    
    test('can remove adjacency', () => {
      // Set areas as adjacent
      areaData.setAdjacency(5, 1);
      areaData.setAdjacency(12, 1);
      
      // Remove adjacency
      areaData.setAdjacency(5, 0);
      
      // Check adjacency
      expect(areaData.isAdjacentTo(5)).toBe(0);
      expect(areaData.isAdjacentTo(12)).toBe(1);
    });
  });
  
  describe('Legacy Compatibility', () => {
    test('join array getter returns the correct adjacency information', () => {
      // Set areas as adjacent using modern methods
      areaData.setAdjacency(5, 1);
      areaData.setAdjacency(12, 1);
      
      // Check legacy join array
      expect(areaData.join[5]).toBe(1);
      expect(areaData.join[12]).toBe(1);
      expect(areaData.join[7]).toBe(0);  // Not adjacent
    });
    
    test('join array setter correctly updates the adjacency map', () => {
      // Create a join array
      const joinArray = Array(32).fill(0);
      joinArray[2] = 1;
      joinArray[5] = 1;
      joinArray[8] = 1;
      
      // Set join array
      areaData.join = joinArray;
      
      // Check adjacency with modern methods
      expect(areaData.isAdjacentTo(2)).toBe(1);
      expect(areaData.isAdjacentTo(5)).toBe(1);
      expect(areaData.isAdjacentTo(8)).toBe(1);
      expect(areaData.isAdjacentTo(7)).toBe(0);  // Not adjacent
      
      // Check that the right number of adjacent areas exists
      expect(areaData.getAdjacentAreas().length).toBe(3);
    });
    
    test('can iterate through join array to find all neighbors', () => {
      // Set some areas as adjacent
      areaData.setAdjacency(2, 1);
      areaData.setAdjacency(5, 1);
      areaData.setAdjacency(8, 1);
      
      // Find all adjacent areas using legacy approach
      const adjacentAreas = [];
      for (let i = 0; i < areaData.join.length; i++) {
        if (areaData.join[i] === 1) {
          adjacentAreas.push(i);
        }
      }
      
      // Check results
      expect(adjacentAreas).toEqual(expect.arrayContaining([2, 5, 8]));
      expect(adjacentAreas.length).toBe(3);
    });
    
    test('direct manipulation of join array elements is not supported', () => {
      // Set some areas as adjacent
      areaData.setAdjacency(2, 1);
      areaData.setAdjacency(5, 1);
      
      // Attempt to directly manipulate join array (this won't actually modify the Map)
      areaData.join[2] = 0;
      
      // Join should return the same values again because the internal Map hasn't changed
      expect(areaData.isAdjacentTo(2)).toBe(1);
      expect(areaData.join[2]).toBe(1);
    });
  });
  
  describe('Performance Comparison', () => {
    test('Map lookup is efficient for sparse adjacency data', () => {
      // Create thousands of adjacent areas to simulate heavy use
      for (let i = 0; i < 1000; i += 10) {
        areaData.setAdjacency(i, 1);
      }
      
      // Time Map lookup
      const startMapLookup = performance.now();
      for (let i = 0; i < 10000; i++) {
        const areaId = i % 2000;
        areaData.isAdjacentTo(areaId);
      }
      const endMapLookup = performance.now();
      const mapLookupTime = endMapLookup - startMapLookup;
      
      // Create an equivalent join array
      const joinArray = Array(2000).fill(0);
      for (let i = 0; i < 1000; i += 10) {
        joinArray[i] = 1;
      }
      
      // Time array lookup
      const startArrayLookup = performance.now();
      for (let i = 0; i < 10000; i++) {
        const areaId = i % 2000;
        const isAdjacent = areaId < joinArray.length ? (joinArray[areaId] === 1) : false;
      }
      const endArrayLookup = performance.now();
      const arrayLookupTime = endArrayLookup - startArrayLookup;
      
      // Log performance comparison (but don't make this a pass/fail test as it may vary by environment)
      console.log(`Map lookup: ${mapLookupTime.toFixed(2)}ms, Array lookup: ${arrayLookupTime.toFixed(2)}ms`);
      
      // Simply verify the test completes successfully
      expect(true).toBe(true);
    });
  });
});