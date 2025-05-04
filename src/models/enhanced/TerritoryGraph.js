/**
 * TerritoryGraph
 *
 * Enhanced implementation of territory connectivity analysis that uses
 * our AdjacencyGraph and DisjointSet data structures for efficient operations.
 *
 * This class provides methods for:
 * 1. Finding connected territory groups for each player
 * 2. Identifying strategic territories (choke points)
 * 3. Analyzing territory connectivity
 * 4. Finding optimal attack paths
 * 5. Calculating territory values based on strategic importance
 */
import { AdjacencyGraph } from './AdjacencyGraph.js';
import { DisjointSet } from './DisjointSet.js';

export class TerritoryGraph {
  /**
   * Create a new territory graph
   *
   * @param {Map<number, Object>} territories - Map of territory IDs to territory objects
   */
  constructor(territories) {
    // Create the adjacency graph from territory data
    this.graph = new AdjacencyGraph();

    // Territory data
    this.territories = territories;

    // Cache for territory groups by player
    this.groupCache = new Map();

    // Cache for strategic values
    this.strategicValueCache = new Map();

    // Initialize the graph with territories from the map
    for (const [id, territory] of territories.entries()) {
      this.graph.addTerritory(id);
    }

    // Set adjacencies between territories
    for (const [id, territory] of territories.entries()) {
      const adjacentTerritories = territory.getAdjacentAreas
        ? territory.getAdjacentAreas()
        : [...(territory.adjacencyMap?.keys() || [])];

      for (const adjacentId of adjacentTerritories) {
        this.graph.setAdjacency(id, adjacentId);
      }
    }
  }

  /**
   * Update territory ownership and connectivity
   * Should be called when territory ownership changes
   *
   * @param {Map<number, number>} ownershipMap - Map of territory ID to owning player ID
   */
  updateOwnership(ownershipMap) {
    // Clear caches when ownership changes
    this.groupCache.clear();
    this.strategicValueCache.clear();

    // Create ownership lookup function
    this.getOwner = territoryId => ownershipMap.get(territoryId) || 0;
  }

  /**
   * Find all territory groups for a given player
   * Using the enhanced AdjacencyGraph implementation
   *
   * @param {number} playerId - Player ID
   * @returns {Object[]} Array of territory groups, each with id and territories
   */
  getPlayerTerritoryGroups(playerId) {
    // Check if we have cached results
    if (this.groupCache.has(playerId)) {
      return this.groupCache.get(playerId);
    }

    // Get all territory IDs
    const allTerritories = [...this.territories.keys()];

    // Create ownership map for the graph
    const ownershipMap = new Map();
    for (const territoryId of allTerritories) {
      const territory = this.territories.get(territoryId);
      ownershipMap.set(territoryId, territory.arm); // arm is the owning player ID
    }

    // Use the adjacency graph to find groups
    const groupsMap = this.graph.findTerritoryGroups(allTerritories, ownershipMap, playerId);

    // Convert to array format for easier use
    const groups = [];
    for (const [groupId, territories] of groupsMap.entries()) {
      groups.push({
        id: groupId,
        territories: [...territories],
      });
    }

    // Cache the results
    this.groupCache.set(playerId, groups);

    return groups;
  }

  /**
   * Get the largest connected territory group for a player
   *
   * @param {number} playerId - Player ID
   * @returns {Object} Group object with id and territories array
   */
  getLargestTerritoryGroup(playerId) {
    const groups = this.getPlayerTerritoryGroups(playerId);

    // Find the largest group
    let largestGroup = { id: 0, territories: [] };
    for (const group of groups) {
      if (group.territories.length > largestGroup.territories.length) {
        largestGroup = group;
      }
    }

    return largestGroup;
  }

  /**
   * Check if two territories are connected through a player's territories
   *
   * @param {number} territoryId1 - First territory ID
   * @param {number} territoryId2 - Second territory ID
   * @param {number} playerId - Player ID
   * @returns {boolean} True if territories are connected
   */
  areTerritoryConnected(territoryId1, territoryId2, playerId) {
    // Create ownership map for the graph
    const ownershipMap = new Map();
    for (const [id, territory] of this.territories.entries()) {
      ownershipMap.set(id, territory.arm);
    }

    // Use the adjacency graph to check path existence
    return this.graph.pathExists(territoryId1, territoryId2, ownershipMap);
  }

  /**
   * Find all choke point territories for a player
   *
   * @param {number} playerId - Player ID
   * @returns {number[]} Array of territory IDs
   */
  findChokePoints(playerId) {
    // Get all territory IDs
    const allTerritories = [...this.territories.keys()];

    // Create ownership map for the graph
    const ownershipMap = new Map();
    for (const [id, territory] of this.territories.entries()) {
      ownershipMap.set(id, territory.arm);
    }

    // Use the adjacency graph to find choke points
    return this.graph.findChokePoints(allTerritories, ownershipMap, playerId);
  }

  /**
   * Calculate the strategic value of territories for a player
   * Based on connectivity, position, and importance
   *
   * @param {number} playerId - Player ID
   * @returns {Map<number, number>} Map of territory ID to strategic value
   */
  calculateStrategicValues(playerId) {
    // Check cache first
    if (this.strategicValueCache.has(playerId)) {
      return this.strategicValueCache.get(playerId);
    }

    // Get all territory IDs
    const allTerritories = [...this.territories.keys()];

    // Create ownership map for the graph
    const ownershipMap = new Map();
    for (const [id, territory] of this.territories.entries()) {
      ownershipMap.set(id, territory.arm);
    }

    // Use the adjacency graph to calculate strategic values
    const strategicValues = this.graph.calculateStrategicValues(
      allTerritories,
      ownershipMap,
      playerId
    );

    // Add bonus for territories in the largest group
    const largestGroup = this.getLargestTerritoryGroup(playerId);
    for (const territoryId of largestGroup.territories) {
      const currentValue = strategicValues.get(territoryId) || 0;
      strategicValues.set(territoryId, currentValue + 20);
    }

    // Cache the results
    this.strategicValueCache.set(playerId, strategicValues);

    return strategicValues;
  }

  /**
   * Find the most strategically valuable territory for a player
   *
   * @param {number} playerId - Player ID
   * @returns {Object} Most valuable territory data: { id, value }
   */
  getMostStrategicTerritory(playerId) {
    const strategicValues = this.calculateStrategicValues(playerId);

    let highestValue = -1;
    let mostStrategicId = null;

    for (const [territoryId, value] of strategicValues.entries()) {
      if (value > highestValue) {
        highestValue = value;
        mostStrategicId = territoryId;
      }
    }

    return {
      id: mostStrategicId,
      value: highestValue,
    };
  }

  /**
   * Sort territories by strategic value for a player
   *
   * @param {number} playerId - Player ID
   * @returns {Array<Object>} Sorted array of { id, value } pairs
   */
  getTerritoriesByStrategicValue(playerId) {
    const strategicValues = this.calculateStrategicValues(playerId);

    // Convert to array and sort by value
    const territories = [];
    for (const [territoryId, value] of strategicValues.entries()) {
      territories.push({ id: territoryId, value });
    }

    territories.sort((a, b) => b.value - a.value);

    return territories;
  }

  /**
   * Find the optimal attack path from one territory to another
   *
   * @param {number} startTerritoryId - Starting territory ID
   * @param {number} targetTerritoryId - Target territory ID
   * @returns {number[]} Array of territory IDs forming the path, or empty if no path
   */
  findAttackPath(startTerritoryId, targetTerritoryId) {
    // Already adjacent case
    if (this.graph.areAdjacent(startTerritoryId, targetTerritoryId)) {
      return [startTerritoryId, targetTerritoryId];
    }

    // Get territory ownership
    const startTerritory = this.territories.get(startTerritoryId);
    const targetTerritory = this.territories.get(targetTerritoryId);

    if (!startTerritory || !targetTerritory) {
      return [];
    }

    const startOwner = startTerritory.arm;
    const targetOwner = targetTerritory.arm;

    // If owned by the same player, no attack path
    if (startOwner === targetOwner) {
      return [];
    }

    // Breadth-first search to find shortest path
    const visited = new Set([startTerritoryId]);
    const queue = [{ id: startTerritoryId, path: [startTerritoryId] }];

    while (queue.length > 0) {
      const { id, path } = queue.shift();

      // Get adjacent territories
      const adjacentTerritories = this.graph.getAdjacentTerritories(id);

      for (const adjacentId of adjacentTerritories) {
        // If we've reached an adjacent territory to the target, we're done
        if (this.graph.areAdjacent(adjacentId, targetTerritoryId)) {
          return [...path, adjacentId, targetTerritoryId];
        }

        // Skip visited territories
        if (visited.has(adjacentId)) {
          continue;
        }

        // Only consider territories owned by the target's owner for the path
        const territory = this.territories.get(adjacentId);
        if (territory && territory.arm === targetOwner) {
          visited.add(adjacentId);
          queue.push({
            id: adjacentId,
            path: [...path, adjacentId],
          });
        }
      }
    }

    return []; // No path found
  }

  /**
   * Create a territory graph from a Game instance
   *
   * @param {Object} game - Game instance with territory data
   * @returns {TerritoryGraph} New territory graph
   */
  static fromGame(game) {
    return new TerritoryGraph(game.getTerritories());
  }
}
