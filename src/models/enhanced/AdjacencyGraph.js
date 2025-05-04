/**
 * AdjacencyGraph - Efficient territory adjacency tracking
 *
 * This class provides an efficient implementation for tracking
 * territory adjacencies using an adjacency list graph representation.
 * It improves upon the Map-based approach by adding:
 *
 * 1. Efficient territory grouping algorithms
 * 2. Fast connectivity checking
 * 3. Territory group identification by player
 * 4. Path finding between territories
 * 5. Reachability analysis
 *
 * This is used for:
 * - Determining valid attack targets
 * - Finding territory groups for scoring
 * - Analyzing territory connectivity for AI strategies
 * - Identifying choke points and strategic territories
 */
export class AdjacencyGraph {
  /**
   * Create a new adjacency graph
   */
  constructor() {
    // Maps territory IDs to their adjacency lists
    // Using Map<number, Set<number>> for O(1) lookup and membership checks
    this.adjacencyLists = new Map();

    // Cache for territory groups by player
    // Map<playerID, Map<groupID, Set<territoryID>>>
    this._groupCache = new Map();

    // Cache invalidation flag - true when adjacency changes have been made
    this._isDirty = true;
  }

  /**
   * Add a territory to the graph
   *
   * @param {number} territoryId - ID of the territory to add
   * @returns {AdjacencyGraph} this instance for chaining
   */
  addTerritory(territoryId) {
    if (!this.adjacencyLists.has(territoryId)) {
      this.adjacencyLists.set(territoryId, new Set());
      this._isDirty = true;
    }
    return this;
  }

  /**
   * Remove a territory from the graph
   *
   * @param {number} territoryId - ID of the territory to remove
   * @returns {AdjacencyGraph} this instance for chaining
   */
  removeTerritory(territoryId) {
    if (this.adjacencyLists.has(territoryId)) {
      // Remove this territory from all other territories' adjacency lists
      for (const [otherId, adjacencies] of this.adjacencyLists.entries()) {
        if (adjacencies.has(territoryId)) {
          adjacencies.delete(territoryId);
        }
      }

      // Remove the territory itself
      this.adjacencyLists.delete(territoryId);
      this._isDirty = true;
    }
    return this;
  }

  /**
   * Set adjacency between two territories
   *
   * @param {number} territoryId1 - First territory ID
   * @param {number} territoryId2 - Second territory ID
   * @param {boolean} [value=true] - True to add adjacency, false to remove
   * @returns {AdjacencyGraph} this instance for chaining
   */
  setAdjacency(territoryId1, territoryId2, value = true) {
    // Ensure both territories exist in the graph
    this.addTerritory(territoryId1);
    this.addTerritory(territoryId2);

    // Set or remove adjacency bidirectionally
    if (value) {
      this.adjacencyLists.get(territoryId1).add(territoryId2);
      this.adjacencyLists.get(territoryId2).add(territoryId1);
    } else {
      this.adjacencyLists.get(territoryId1).delete(territoryId2);
      this.adjacencyLists.get(territoryId2).delete(territoryId1);
    }

    this._isDirty = true;
    return this;
  }

  /**
   * Check if two territories are adjacent
   *
   * @param {number} territoryId1 - First territory ID
   * @param {number} territoryId2 - Second territory ID
   * @returns {boolean} True if territories are adjacent
   */
  areAdjacent(territoryId1, territoryId2) {
    const list1 = this.adjacencyLists.get(territoryId1);
    return list1 ? list1.has(territoryId2) : false;
  }

  /**
   * Get all territories adjacent to a given territory
   *
   * @param {number} territoryId - Territory ID
   * @returns {number[]} Array of adjacent territory IDs
   */
  getAdjacentTerritories(territoryId) {
    const list = this.adjacencyLists.get(territoryId);
    return list ? [...list] : [];
  }

  /**
   * Get the number of adjacent territories
   *
   * @param {number} territoryId - Territory ID
   * @returns {number} Number of adjacent territories
   */
  getAdjacentCount(territoryId) {
    const list = this.adjacencyLists.get(territoryId);
    return list ? list.size : 0;
  }

  /**
   * Find all territory groups for a given player.
   * A group is a set of connected territories all owned by the same player.
   *
   * @param {number[]} territories - Array of all territory IDs
   * @param {Map<number, number>} ownershipMap - Map of territory ID to owning player ID
   * @param {number} playerId - Player ID
   * @returns {Map<number, Set<number>>} Map of group ID to set of territory IDs
   */
  findTerritoryGroups(territories, ownershipMap, playerId) {
    // Check if we have a valid cached result
    if (!this._isDirty && this._groupCache.has(playerId)) {
      return this._groupCache.get(playerId);
    }

    // Filter territories owned by the player
    const playerTerritories = territories.filter(id => ownershipMap.get(id) === playerId);

    // Map to track visited territories during traversal
    const visited = new Set();

    // Result map of group ID to set of territory IDs
    const groups = new Map();
    let groupId = 1;

    // Perform a breadth-first search from each unvisited territory
    for (const startId of playerTerritories) {
      if (visited.has(startId)) continue;

      // Start a new group
      const group = new Set();
      const queue = [startId];
      visited.add(startId);
      group.add(startId);

      // Process the queue
      while (queue.length > 0) {
        const currentId = queue.shift();
        const adjacentTerritories = this.getAdjacentTerritories(currentId);

        // Check all adjacent territories
        for (const neighborId of adjacentTerritories) {
          // Add to group if owned by player and not visited
          if (ownershipMap.get(neighborId) === playerId && !visited.has(neighborId)) {
            visited.add(neighborId);
            group.add(neighborId);
            queue.push(neighborId);
          }
        }
      }

      // Add the completed group to the result
      groups.set(groupId++, group);
    }

    // Cache the result for this player
    this._groupCache.set(playerId, groups);

    return groups;
  }

  /**
   * Find the largest territory group for a player
   *
   * @param {number[]} territories - Array of all territory IDs
   * @param {Map<number, number>} ownershipMap - Map of territory ID to owning player ID
   * @param {number} playerId - Player ID
   * @returns {Set<number>} Set of territory IDs in the largest group
   */
  findLargestGroup(territories, ownershipMap, playerId) {
    const groups = this.findTerritoryGroups(territories, ownershipMap, playerId);

    let largestGroup = new Set();
    for (const group of groups.values()) {
      if (group.size > largestGroup.size) {
        largestGroup = group;
      }
    }

    return largestGroup;
  }

  /**
   * Check if a path exists between two territories owned by the same player
   *
   * @param {number} startId - Starting territory ID
   * @param {number} endId - Target territory ID
   * @param {Map<number, number>} ownershipMap - Map of territory ID to owning player ID
   * @returns {boolean} True if a path exists
   */
  pathExists(startId, endId, ownershipMap) {
    const playerId = ownershipMap.get(startId);

    // If territories aren't owned by the same player, no path exists
    if (playerId !== ownershipMap.get(endId)) {
      return false;
    }

    // If they're the same territory, path exists
    if (startId === endId) {
      return true;
    }

    // Breadth-first search to find a path
    const visited = new Set([startId]);
    const queue = [startId];

    while (queue.length > 0) {
      const currentId = queue.shift();
      const adjacentTerritories = this.getAdjacentTerritories(currentId);

      for (const neighborId of adjacentTerritories) {
        if (neighborId === endId) {
          return true; // Found the destination
        }

        // Add to queue if owned by player and not visited
        if (ownershipMap.get(neighborId) === playerId && !visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      }
    }

    return false; // No path found
  }

  /**
   * Find all territories that are choke points for a player
   * A choke point is a territory whose removal would increase the number of
   * disconnected territory groups for that player
   *
   * @param {number[]} territories - Array of all territory IDs
   * @param {Map<number, number>} ownershipMap - Map of territory ID to owning player ID
   * @param {number} playerId - Player ID
   * @returns {number[]} Array of choke point territory IDs
   */
  findChokePoints(territories, ownershipMap, playerId) {
    const chokePoints = [];
    const originalGroups = this.findTerritoryGroups(territories, ownershipMap, playerId);
    const originalGroupCount = originalGroups.size;

    // Filter territories owned by the player
    const playerTerritories = territories.filter(id => ownershipMap.get(id) === playerId);

    // For each territory, check if removing it increases the number of groups
    for (const territoryId of playerTerritories) {
      // Create a new ownership map with this territory removed
      const modifiedOwnership = new Map(ownershipMap);
      modifiedOwnership.set(territoryId, -1); // Mark as not owned by player

      // Find groups with the territory removed
      const newGroups = this.findTerritoryGroups(territories, modifiedOwnership, playerId);

      // If removing the territory increases the number of groups, it's a choke point
      if (newGroups.size > originalGroupCount) {
        chokePoints.push(territoryId);
      }
    }

    return chokePoints;
  }

  /**
   * Calculate the strategic value of each territory for a player
   * based on connectivity, adjacency, and choke point status
   *
   * @param {number[]} territories - Array of all territory IDs
   * @param {Map<number, number>} ownershipMap - Map of territory ID to owning player ID
   * @param {number} playerId - Player ID
   * @returns {Map<number, number>} Map of territory ID to strategic value
   */
  calculateStrategicValues(territories, ownershipMap, playerId) {
    const strategicValues = new Map();
    const chokePoints = new Set(this.findChokePoints(territories, ownershipMap, playerId));

    // Filter territories owned by the player
    const playerTerritories = territories.filter(id => ownershipMap.get(id) === playerId);

    // Calculate strategic value for each player territory
    for (const territoryId of playerTerritories) {
      let value = 0;

      // Count adjacent enemy territories (frontline bonus)
      const adjacentTerritories = this.getAdjacentTerritories(territoryId);
      const enemyAdjacent = adjacentTerritories.filter(
        id => ownershipMap.get(id) !== playerId && ownershipMap.get(id) !== 0
      );

      value += enemyAdjacent.length * 10; // Frontline bonus

      // Choke point bonus
      if (chokePoints.has(territoryId)) {
        value += 50;
      }

      // Connectivity bonus (more connected = more valuable)
      value += this.getAdjacentCount(territoryId) * 5;

      strategicValues.set(territoryId, value);
    }

    return strategicValues;
  }

  /**
   * Clear cached data
   */
  invalidateCache() {
    this._groupCache.clear();
    this._isDirty = true;
  }

  /**
   * Create an adjacency graph from the given territories
   *
   * @param {Array<object>} territories - Array of territory objects with adjacency information
   * @param {Function} getAdjacencyList - Function to extract adjacency list from a territory
   * @returns {AdjacencyGraph} New adjacency graph
   */
  static fromTerritories(territories, getAdjacencyList) {
    const graph = new AdjacencyGraph();

    // Add all territories to the graph
    for (const territory of territories) {
      const id = territory.id || territories.indexOf(territory);
      graph.addTerritory(id);
    }

    // Set adjacencies between territories
    for (const territory of territories) {
      const id = territory.id || territories.indexOf(territory);
      const adjacencyList = getAdjacencyList(territory);

      for (const adjacentId of adjacencyList) {
        graph.setAdjacency(id, adjacentId);
      }
    }

    return graph;
  }
}
