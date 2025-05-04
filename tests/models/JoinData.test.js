/**
 * Tests for JoinData Model Class
 * 
 * This file contains tests for the JoinData class, which contains adjacency
 * information for a cell in the hexagonal grid.
 */

import { JoinData } from '../../src/models/JoinData.js';

describe('JoinData', () => {
  let joinData;
  
  beforeEach(() => {
    // Create a fresh JoinData instance for each test
    joinData = new JoinData();
  });
  
  describe('Constructor', () => {
    test('initializes the dir array with six zeros', () => {
      expect(joinData.dir).toBeInstanceOf(Array);
      expect(joinData.dir.length).toBe(6);
      expect(joinData.dir).toEqual([0, 0, 0, 0, 0, 0]);
    });
  });
  
  describe('Direction Management', () => {
    test('can set and retrieve direction values', () => {
      // Set directions for a cell in the middle of the grid
      joinData.dir[0] = 101; // Upper right
      joinData.dir[1] = 102; // Right
      joinData.dir[2] = 103; // Bottom right
      joinData.dir[3] = 104; // Bottom left
      joinData.dir[4] = 105; // Left
      joinData.dir[5] = 106; // Upper left
      
      // Check each direction
      expect(joinData.dir[0]).toBe(101);
      expect(joinData.dir[1]).toBe(102);
      expect(joinData.dir[2]).toBe(103);
      expect(joinData.dir[3]).toBe(104);
      expect(joinData.dir[4]).toBe(105);
      expect(joinData.dir[5]).toBe(106);
    });
    
    test('can set direction to -1 to indicate edge of grid', () => {
      // Set some directions to indicate edge of grid
      joinData.dir[0] = -1; // No neighbor in upper right (edge of grid)
      joinData.dir[5] = -1; // No neighbor in upper left (edge of grid)
      
      // Other directions have neighbors
      joinData.dir[1] = 102;
      joinData.dir[2] = 103;
      joinData.dir[3] = 104;
      joinData.dir[4] = 105;
      
      // Check edge directions
      expect(joinData.dir[0]).toBe(-1);
      expect(joinData.dir[5]).toBe(-1);
      
      // Check other directions
      expect(joinData.dir[1]).toBe(102);
      expect(joinData.dir[2]).toBe(103);
      expect(joinData.dir[3]).toBe(104);
      expect(joinData.dir[4]).toBe(105);
    });
    
    test('can check if a cell has a neighbor in a given direction', () => {
      // Set up with some neighbors
      joinData.dir[0] = 101;
      joinData.dir[1] = 102;
      joinData.dir[2] = -1;  // No neighbor
      joinData.dir[3] = -1;  // No neighbor
      joinData.dir[4] = 105;
      joinData.dir[5] = 106;
      
      // Check for neighbors
      const hasUpperRightNeighbor = joinData.dir[0] >= 0;
      const hasRightNeighbor = joinData.dir[1] >= 0;
      const hasBottomRightNeighbor = joinData.dir[2] >= 0;
      const hasBottomLeftNeighbor = joinData.dir[3] >= 0;
      
      // Verify results
      expect(hasUpperRightNeighbor).toBe(true);
      expect(hasRightNeighbor).toBe(true);
      expect(hasBottomRightNeighbor).toBe(false);
      expect(hasBottomLeftNeighbor).toBe(false);
    });
    
    test('can count the number of valid neighbors', () => {
      // Set up with some neighbors
      joinData.dir[0] = 101;
      joinData.dir[1] = 102;
      joinData.dir[2] = -1;  // No neighbor
      joinData.dir[3] = -1;  // No neighbor
      joinData.dir[4] = 105;
      joinData.dir[5] = 106;
      
      // Count valid neighbors
      let neighborCount = 0;
      for (let i = 0; i < joinData.dir.length; i++) {
        if (joinData.dir[i] >= 0) {
          neighborCount++;
        }
      }
      
      // Verify count
      expect(neighborCount).toBe(4);
    });
  });
});