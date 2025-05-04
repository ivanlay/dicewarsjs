/**
 * Tests for AreaData Model Class
 *
 * This file contains tests for the AreaData class, which represents
 * a territory on the game map with information about ownership,
 * dice counts, and adjacency to other territories.
 */

import { AreaData } from '../../src/models/AreaData.js';

describe('AreaData', () => {
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

      // Adjacency array
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
      areaData.line_dir[0] = 1; // Right
      areaData.line_dir[1] = 2; // Bottom-right
      areaData.line_dir[2] = 4; // Left

      expect(areaData.line_dir[0]).toBe(1);
      expect(areaData.line_dir[1]).toBe(2);
      expect(areaData.line_dir[2]).toBe(4);
    });
  });

  describe('Adjacency Tracking', () => {
    test('can set and retrieve adjacency information', () => {
      // Set area 5 as adjacent to this area
      areaData.join[5] = 1;

      // Set area 12 as adjacent to this area
      areaData.join[12] = 1;

      // Check adjacency
      expect(areaData.join[5]).toBe(1);
      expect(areaData.join[12]).toBe(1);
      expect(areaData.join[7]).toBe(0); // Not adjacent
    });

    test('can iterate through adjacency array to find all neighbors', () => {
      // Set some areas as adjacent
      areaData.join[2] = 1;
      areaData.join[5] = 1;
      areaData.join[8] = 1;

      // Find all adjacent areas
      const adjacentAreas = [];
      for (let i = 0; i < areaData.join.length; i++) {
        if (areaData.join[i] === 1) {
          adjacentAreas.push(i);
        }
      }

      // Check results
      expect(adjacentAreas).toEqual([2, 5, 8]);
      expect(adjacentAreas.length).toBe(3);
    });
  });
});
