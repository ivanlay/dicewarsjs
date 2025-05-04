/**
 * Enhanced Area Data Structure
 *
 * An ES6+ implementation of the AreaData class using Maps for better performance.
 * Represents a territory on the game map, containing information about:
 * - Size and position
 * - Ownership (player/army)
 * - Dice count
 * - Border information for rendering
 * - Adjacency to other territories using Map data structure
 */
export class AreaData {
  constructor() {
    // Basic properties
    this.size = 0; // Size of area (0 = not present, >0 = number of cells)
    this.cpos = 0; // Center cell position (used for dice placement)
    this.arm = 0; // Player/army affiliation (color)
    this.dice = 0; // Number of dice in this territory

    // Bounding box for determining center location
    this.left = 0; // Leftmost cell x-coordinate
    this.right = 0; // Rightmost cell x-coordinate
    this.top = 0; // Topmost cell y-coordinate
    this.bottom = 0; // Bottommost cell y-coordinate
    this.cx = 0; // Center x-coordinate (middle point between left and right)
    this.cy = 0; // Center y-coordinate (middle point between top and bottom)
    this.len_min = 0; // Minimum distance to center (used for finding optimal center)

    // Border drawing information - still using arrays for compatibility
    this.line_cel = new Array(100); // Border cell indices
    this.line_dir = new Array(100); // Border directions (0-5 for hexagonal grid)

    // Adjacency map - maps area IDs to adjacency status (1 = adjacent, undefined = not adjacent)
    // This replaces the join array with a more efficient Map
    this.adjacencyMap = new Map();
  }

  /**
   * Get the adjacency status of another area
   *
   * @param {number} areaId - The ID of the area to check adjacency with
   * @returns {number} 1 if adjacent, 0 if not adjacent
   */
  isAdjacentTo(areaId) {
    return this.adjacencyMap.get(areaId) || 0;
  }

  /**
   * Set adjacency status with another area
   *
   * @param {number} areaId - The ID of the area to set adjacency with
   * @param {number} status - 1 for adjacent, 0 for not adjacent
   */
  setAdjacency(areaId, status) {
    if (status === 0) {
      this.adjacencyMap.delete(areaId);
    } else {
      this.adjacencyMap.set(areaId, status);
    }
  }

  /**
   * Get all adjacent area IDs
   *
   * @returns {number[]} Array of adjacent area IDs
   */
  getAdjacentAreas() {
    return [...this.adjacencyMap.keys()];
  }

  /**
   * Legacy compatibility getter for join array
   * This property emulates the original join array for backward compatibility
   */
  get join() {
    // Create a sparse array with 32 empty slots
    const joinArray = Array(32).fill(0);

    // Fill in the adjacency information from the Map
    for (const [areaId, status] of this.adjacencyMap.entries()) {
      if (areaId < 32) {
        joinArray[areaId] = status;
      }
    }

    return joinArray;
  }

  /**
   * Legacy compatibility setter for join array
   * This allows direct assignment to the join array for backward compatibility
   */
  set join(joinArray) {
    if (!Array.isArray(joinArray)) return;

    // Clear existing adjacency map
    this.adjacencyMap.clear();

    // Add entries from the array to the Map
    for (let i = 0; i < joinArray.length; i++) {
      if (joinArray[i] === 1) {
        this.adjacencyMap.set(i, 1);
      }
    }
  }
}
