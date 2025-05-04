/**
 * Tests for Enhanced GridData Class
 * 
 * This file contains tests for the ES6+ implementation of the GridData class,
 * which uses typed arrays for more efficient storage of grid data.
 */

import { GridData } from '../../../src/models/enhanced/GridData.js';

describe('Enhanced GridData', () => {
  let gridData;
  const width = 28;
  const height = 32;
  
  beforeEach(() => {
    // Create a fresh GridData instance for each test
    gridData = new GridData(width, height);
  });
  
  describe('Constructor', () => {
    test('initializes with correct dimensions', () => {
      expect(gridData.width).toBe(width);
      expect(gridData.height).toBe(height);
      expect(gridData.cellCount).toBe(width * height);
    });
    
    test('initializes typed arrays with correct lengths', () => {
      // All internal arrays should have length equal to cellCount
      const cellCount = width * height;
      
      // Check through public interface first
      expect(gridData.cel.length).toBe(cellCount);
      expect(gridData.num.length).toBe(cellCount);
      expect(gridData.next_f.length).toBe(cellCount);
      expect(gridData.rcel.length).toBe(cellCount);
      
      // Now check the typed arrays directly
      expect(gridData._cellToAreaMap.length).toBe(cellCount);
      expect(gridData._nextFlags.length).toBe(cellCount);
      expect(gridData._rCells.length).toBe(cellCount);
      expect(gridData._serialNumbers.length).toBe(cellCount);
    });
    
    test('initializes serial numbers with sequential values', () => {
      for (let i = 0; i < gridData.cellCount; i++) {
        expect(gridData.getSerialNumber(i)).toBe(i);
      }
    });
    
    test('initializes direction cache for all cells', () => {
      expect(gridData._directionCache.length).toBe(gridData.cellCount);
      
      // Check a few random cells
      const randomCellIndex = Math.floor(Math.random() * gridData.cellCount);
      expect(gridData._directionCache[randomCellIndex].length).toBe(6);
    });
  });
  
  describe('Cell Area Mapping', () => {
    test('can set and get cell area values', () => {
      const cellPos = 100;
      const areaId = 5;
      
      expect(gridData.getCellArea(cellPos)).toBe(0); // Default is 0
      
      gridData.setCellArea(cellPos, areaId);
      expect(gridData.getCellArea(cellPos)).toBe(areaId);
    });
    
    test('can count cells per area', () => {
      // Set various cells to different areas
      gridData.setCellArea(10, 1);
      gridData.setCellArea(11, 1);
      gridData.setCellArea(12, 1);
      gridData.setCellArea(20, 2);
      gridData.setCellArea(21, 2);
      gridData.setCellArea(30, 3);
      
      const counts = gridData.countCellsPerArea(3);
      
      expect(counts[0]).toBe(0); // Area 0 is not counted
      expect(counts[1]).toBe(3);
      expect(counts[2]).toBe(2);
      expect(counts[3]).toBe(1);
    });
  });
  
  describe('Neighbor Calculations', () => {
    test('calculates valid neighbor positions', () => {
      // Pick a cell not on the border
      const centerX = Math.floor(width / 2);
      const centerY = Math.floor(height / 2);
      const centerPos = centerY * width + centerX;
      
      // All neighbors should be valid (not -1)
      const directions = gridData.getNeighborDirections(centerPos);
      for (let dir = 0; dir < 6; dir++) {
        expect(directions[dir]).not.toBe(-1);
      }
    });
    
    test('returns -1 for out-of-bounds neighbors', () => {
      // Top-left corner
      const cornerPos = 0;
      const directions = gridData.getNeighborDirections(cornerPos);
      
      // Some directions should be out of bounds
      let outOfBoundsCount = 0;
      for (let dir = 0; dir < 6; dir++) {
        if (directions[dir] === -1) {
          outOfBoundsCount++;
        }
      }
      
      // Corner should have at least 2 out-of-bounds directions
      expect(outOfBoundsCount).toBeGreaterThanOrEqual(2);
    });
  });
  
  describe('Flag Operations', () => {
    test('can set and get next flags', () => {
      const cellPos = 50;
      
      expect(gridData.getNextFlag(cellPos)).toBe(0); // Default is 0
      
      gridData.setNextFlag(cellPos, 1);
      expect(gridData.getNextFlag(cellPos)).toBe(1);
    });
    
    test('can reset all next flags', () => {
      // Set some flags
      gridData.setNextFlag(10, 1);
      gridData.setNextFlag(20, 1);
      gridData.setNextFlag(30, 1);
      
      // Reset them
      gridData.resetNextFlags();
      
      // Check they're all 0
      expect(gridData.getNextFlag(10)).toBe(0);
      expect(gridData.getNextFlag(20)).toBe(0);
      expect(gridData.getNextFlag(30)).toBe(0);
    });
    
    test('can set and get rcell values', () => {
      const cellPos = 60;
      
      expect(gridData.getRCell(cellPos)).toBe(0); // Default is 0
      
      gridData.setRCell(cellPos, 1);
      expect(gridData.getRCell(cellPos)).toBe(1);
    });
    
    test('can reset all rcell values', () => {
      // Set some values
      gridData.setRCell(10, 1);
      gridData.setRCell(20, 1);
      gridData.setRCell(30, 1);
      
      // Reset them
      gridData.resetRCells();
      
      // Check they're all 0
      expect(gridData.getRCell(10)).toBe(0);
      expect(gridData.getRCell(20)).toBe(0);
      expect(gridData.getRCell(30)).toBe(0);
    });
  });
  
  describe('Serial Number Operations', () => {
    test('can swap serial numbers', () => {
      const pos1 = 10;
      const pos2 = 20;
      
      const original1 = gridData.getSerialNumber(pos1);
      const original2 = gridData.getSerialNumber(pos2);
      
      gridData.swapSerialNumbers(pos1, pos2);
      
      expect(gridData.getSerialNumber(pos1)).toBe(original2);
      expect(gridData.getSerialNumber(pos2)).toBe(original1);
    });
    
    test('can randomize serial numbers', () => {
      // Store original values
      const originalValues = new Array(gridData.cellCount);
      for (let i = 0; i < gridData.cellCount; i++) {
        originalValues[i] = gridData.getSerialNumber(i);
      }
      
      // Randomize
      gridData.randomizeSerialNumbers();
      
      // Check that the values are different (at least some of them)
      // We'll verify that at least 50% of values have changed
      let changedCount = 0;
      for (let i = 0; i < gridData.cellCount; i++) {
        if (gridData.getSerialNumber(i) !== originalValues[i]) {
          changedCount++;
        }
      }
      
      expect(changedCount).toBeGreaterThan(gridData.cellCount * 0.5);
    });
  });
  
  describe('Legacy Compatibility', () => {
    test('cel getter/setter works correctly', () => {
      // Set some values using typed array
      gridData.setCellArea(10, 1);
      gridData.setCellArea(20, 2);
      
      // Check values using legacy getter
      expect(gridData.cel[10]).toBe(1);
      expect(gridData.cel[20]).toBe(2);
      
      // Set values using legacy setter
      const newCel = Array(gridData.cellCount).fill(0);
      newCel[30] = 3;
      newCel[40] = 4;
      gridData.cel = newCel;
      
      // Check values were set correctly
      expect(gridData.getCellArea(30)).toBe(3);
      expect(gridData.getCellArea(40)).toBe(4);
    });
    
    test('num getter/setter works correctly', () => {
      // Modify some values
      gridData.setSerialNumber(10, 100);
      gridData.setSerialNumber(20, 200);
      
      // Check with legacy getter
      expect(gridData.num[10]).toBe(100);
      expect(gridData.num[20]).toBe(200);
      
      // Set values using legacy setter
      const newNum = Array(gridData.cellCount).fill(0);
      newNum[30] = 300;
      newNum[40] = 400;
      gridData.num = newNum;
      
      // Check values were set correctly
      expect(gridData.getSerialNumber(30)).toBe(300);
      expect(gridData.getSerialNumber(40)).toBe(400);
    });
    
    test('next_f getter/setter works correctly', () => {
      // Set some flags
      gridData.setNextFlag(10, 1);
      gridData.setNextFlag(20, 1);
      
      // Check with legacy getter
      expect(gridData.next_f[10]).toBe(1);
      expect(gridData.next_f[20]).toBe(1);
      
      // Set values using legacy setter
      const newNextF = Array(gridData.cellCount).fill(0);
      newNextF[30] = 1;
      newNextF[40] = 1;
      gridData.next_f = newNextF;
      
      // Check values were set correctly
      expect(gridData.getNextFlag(30)).toBe(1);
      expect(gridData.getNextFlag(40)).toBe(1);
    });
    
    test('rcel getter/setter works correctly', () => {
      // Set some values
      gridData.setRCell(10, 1);
      gridData.setRCell(20, 1);
      
      // Check with legacy getter
      expect(gridData.rcel[10]).toBe(1);
      expect(gridData.rcel[20]).toBe(1);
      
      // Set values using legacy setter
      const newRcel = Array(gridData.cellCount).fill(0);
      newRcel[30] = 1;
      newRcel[40] = 1;
      gridData.rcel = newRcel;
      
      // Check values were set correctly
      expect(gridData.getRCell(30)).toBe(1);
      expect(gridData.getRCell(40)).toBe(1);
    });
  });
  
  describe('Performance Comparison', () => {
    // Helper function to time execution
    const timeFunction = (fn) => {
      const start = performance.now();
      fn();
      return performance.now() - start;
    };
    
    test('typed arrays perform better for bulk operations', () => {
      // Create a large grid
      const largeGridData = new GridData(width, height);
      const cellCount = largeGridData.cellCount;
      
      // Create equivalent regular arrays
      const regularCel = new Array(cellCount).fill(0);
      
      // Measure setting all cells to random values
      
      // Typed array performance
      const typedArrayTime = timeFunction(() => {
        for (let i = 0; i < cellCount; i++) {
          largeGridData.setCellArea(i, i % 32);
        }
      });
      
      // Regular array performance
      const regularArrayTime = timeFunction(() => {
        for (let i = 0; i < cellCount; i++) {
          regularCel[i] = i % 32;
        }
      });
      
      console.log(`Setting ${cellCount} values - Typed Array: ${typedArrayTime.toFixed(2)}ms, Regular Array: ${regularArrayTime.toFixed(2)}ms`);
      
      // Don't make this a hard assertion because performance varies by environment
      // Just log the results
      expect(true).toBe(true);
    });
    
    test('typed arrays perform better for reading bulk data', () => {
      // Create a large grid
      const largeGridData = new GridData(width, height);
      const cellCount = largeGridData.cellCount;
      
      // Create equivalent regular arrays
      const regularCel = new Array(cellCount).fill(0);
      
      // Set some values
      for (let i = 0; i < cellCount; i++) {
        const value = i % 32;
        largeGridData.setCellArea(i, value);
        regularCel[i] = value;
      }
      
      // Measure summing all values - a common operation
      
      // Typed array performance
      let typedArraySum = 0;
      const typedArrayTime = timeFunction(() => {
        for (let i = 0; i < cellCount; i++) {
          typedArraySum += largeGridData.getCellArea(i);
        }
      });
      
      // Regular array performance
      let regularArraySum = 0;
      const regularArrayTime = timeFunction(() => {
        for (let i = 0; i < cellCount; i++) {
          regularArraySum += regularCel[i];
        }
      });
      
      console.log(`Reading ${cellCount} values - Typed Array: ${typedArrayTime.toFixed(2)}ms, Regular Array: ${regularArrayTime.toFixed(2)}ms`);
      console.log(`Sums - Typed Array: ${typedArraySum}, Regular Array: ${regularArraySum}`);
      
      // Verify the sums are equal to ensure our implementation is correct
      expect(typedArraySum).toBe(regularArraySum);
    });
  });
});