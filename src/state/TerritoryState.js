/**
 * TerritoryState - Immutable Territory State Management
 *
 * This module provides functions for working with immutable territory data.
 * Territories are a critical part of the game state, representing the areas
 * players control on the map.
 */

import { deepFreeze, updateObject, addSetItem, deleteSetItem } from './ImmutableUtils.js';

/**
 * Create a new territory state object
 *
 * @param {number} id - Territory ID
 * @param {Object} props - Territory properties
 * @returns {Object} Immutable territory state
 */
export const createTerritory = (id, props = {}) => {
  const territory = {
    id,
    owner: 0, // Player ID who owns this territory
    diceCount: 1, // Number of dice on this territory
    size: 0, // Number of cells in this territory
    cells: new Set(), // Set of cell indices that make up this territory
    adjacentTerritories: new Set(), // Set of adjacent territory IDs
    centerX: 0, // Visual center X coordinate
    centerY: 0, // Visual center Y coordinate
    borderCells: [], // Cells that form the border (for rendering)
    isSelected: false, // UI selection state
    ...props,
  };

  return deepFreeze(territory);
};

/**
 * TerritoryState utilities for working with immutable territory data
 */
export const TerritoryState = {
  /**
   * Create a new territory
   *
   * @param {number} id - Territory ID
   * @param {Object} props - Territory properties
   * @returns {Object} Immutable territory state
   */
  create: (id, props) => createTerritory(id, props),

  /**
   * Update a territory with new values
   *
   * @param {Object} territory - Original territory state
   * @param {Object} updates - Properties to update
   * @returns {Object} New immutable territory state
   */
  update: (territory, updates) => updateObject(territory, updates),

  /**
   * Add a cell to a territory
   *
   * @param {Object} territory - Original territory state
   * @param {number} cellIndex - Cell index to add
   * @returns {Object} New territory state with cell added
   */
  addCell: (territory, cellIndex) => {
    const newCells = addSetItem(territory.cells, cellIndex);
    return updateObject(territory, {
      cells: newCells,
      size: newCells.size,
    });
  },

  /**
   * Remove a cell from a territory
   *
   * @param {Object} territory - Original territory state
   * @param {number} cellIndex - Cell index to remove
   * @returns {Object} New territory state with cell removed
   */
  removeCell: (territory, cellIndex) => {
    const newCells = deleteSetItem(territory.cells, cellIndex);
    return updateObject(territory, {
      cells: newCells,
      size: newCells.size,
    });
  },

  /**
   * Add an adjacent territory
   *
   * @param {Object} territory - Original territory state
   * @param {number} adjacentId - Adjacent territory ID
   * @returns {Object} New territory state with adjacency added
   */
  addAdjacent: (territory, adjacentId) => {
    const newAdjacent = addSetItem(territory.adjacentTerritories, adjacentId);
    return updateObject(territory, { adjacentTerritories: newAdjacent });
  },

  /**
   * Remove an adjacent territory
   *
   * @param {Object} territory - Original territory state
   * @param {number} adjacentId - Adjacent territory ID to remove
   * @returns {Object} New territory state with adjacency removed
   */
  removeAdjacent: (territory, adjacentId) => {
    const newAdjacent = deleteSetItem(territory.adjacentTerritories, adjacentId);
    return updateObject(territory, { adjacentTerritories: newAdjacent });
  },

  /**
   * Change territory ownership
   *
   * @param {Object} territory - Original territory state
   * @param {number} newOwner - New owner player ID
   * @param {number} diceCount - New dice count (optional)
   * @returns {Object} New territory state with ownership changed
   */
  changeOwner: (territory, newOwner, diceCount = territory.diceCount) =>
    updateObject(territory, {
      owner: newOwner,
      diceCount,
    }),

  /**
   * Add dice to territory
   *
   * @param {Object} territory - Original territory state
   * @param {number} count - Number of dice to add
   * @returns {Object} New territory state with updated dice count
   */
  addDice: (territory, count) =>
    updateObject(territory, {
      diceCount: territory.diceCount + count,
    }),

  /**
   * Set dice count on territory
   *
   * @param {Object} territory - Original territory state
   * @param {number} count - New dice count
   * @returns {Object} New territory state with updated dice count
   */
  setDiceCount: (territory, count) => updateObject(territory, { diceCount: count }),

  /**
   * Toggle selection state
   *
   * @param {Object} territory - Original territory state
   * @returns {Object} New territory state with toggled selection
   */
  toggleSelection: territory => updateObject(territory, { isSelected: !territory.isSelected }),

  /**
   * Set selection state
   *
   * @param {Object} territory - Original territory state
   * @param {boolean} isSelected - New selection state
   * @returns {Object} New territory state with updated selection
   */
  setSelected: (territory, isSelected) => updateObject(territory, { isSelected }),

  /**
   * Check if territories are adjacent
   *
   * @param {Object} territory - Territory to check from
   * @param {number} adjacentId - Adjacent territory ID to check
   * @returns {boolean} True if territories are adjacent
   */
  isAdjacentTo: (territory, adjacentId) => territory.adjacentTerritories.has(adjacentId),

  /**
   * Get all adjacent territory IDs
   *
   * @param {Object} territory - Territory to get adjacencies for
   * @returns {number[]} Array of adjacent territory IDs
   */
  getAdjacentIds: territory => [...territory.adjacentTerritories],

  /**
   * Check if territory can attack another
   *
   * @param {Object} territory - Attacking territory
   * @param {Object} target - Target territory
   * @returns {boolean} True if attack is valid
   */
  canAttack: (territory, target) =>
    territory.owner !== target.owner &&
    territory.diceCount > 1 &&
    territory.adjacentTerritories.has(target.id),

  /**
   * Create a territory state compatible with legacy code
   *
   * @param {Object} territory - Immutable territory state
   * @returns {Object} Legacy format territory object
   */
  toLegacyFormat: territory => {
    const legacyTerritory = {
      size: territory.size,
      arm: territory.owner,
      dice: territory.diceCount,
      cpos: territory.centerCell || 0,
      cx: territory.centerX,
      cy: territory.centerY,
      // Create legacy join array for compatibility
      join: Array(32).fill(0),
    };

    // Add adjacency info to join array
    for (const adjId of territory.adjacentTerritories) {
      if (adjId < 32) {
        legacyTerritory.join[adjId] = 1;
      }
    }

    // Add border information if available
    if (territory.borderCells && territory.borderDirections) {
      legacyTerritory.line_cel = [...territory.borderCells];
      legacyTerritory.line_dir = [...territory.borderDirections];
    }

    return legacyTerritory;
  },

  /**
   * Create an immutable territory state from legacy format
   *
   * @param {number} id - Territory ID
   * @param {Object} legacyTerritory - Legacy format territory
   * @returns {Object} Immutable territory state
   */
  fromLegacyFormat: (id, legacyTerritory) => {
    // Extract adjacencies from join array
    const adjacentTerritories = new Set();
    if (legacyTerritory.join) {
      for (let i = 0; i < legacyTerritory.join.length; i++) {
        if (legacyTerritory.join[i] === 1) {
          adjacentTerritories.add(i);
        }
      }
    }

    return createTerritory(id, {
      owner: legacyTerritory.arm || 0,
      diceCount: legacyTerritory.dice || 1,
      size: legacyTerritory.size || 0,
      centerX: legacyTerritory.cx || 0,
      centerY: legacyTerritory.cy || 0,
      centerCell: legacyTerritory.cpos || 0,
      adjacentTerritories,
      borderCells: legacyTerritory.line_cel ? [...legacyTerritory.line_cel] : [],
      borderDirections: legacyTerritory.line_dir ? [...legacyTerritory.line_dir] : [],
    });
  },
};
