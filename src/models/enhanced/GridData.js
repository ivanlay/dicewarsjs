/**
 * Enhanced Grid Data
 *
 * Uses typed arrays for efficient storage and manipulation of grid/map data.
 * Provides a consistent interface for working with hexagonal grid data.
 */

export class GridData {
  /**
   * Create a new grid data object
   *
   * @param {number} width - Width of the grid in cells
   * @param {number} height - Height of the grid in cells
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cellCount = width * height;

    // Cell-to-territory mapping (values 0-32, 0 = no territory)
    // Using Uint8Array since we have at most 32 territories
    this._cellToAreaMap = new Uint8Array(this.cellCount);

    // Temporal cell flags for territory growth (values 0-1)
    this._nextFlags = new Uint8Array(this.cellCount);
    this._rCells = new Uint8Array(this.cellCount);

    // Serial numbers for randomization (values 0 to cellCount-1)
    this._serialNumbers = new Uint16Array(this.cellCount);
    for (let i = 0; i < this.cellCount; i++) {
      this._serialNumbers[i] = i;
    }

    // Initialize direction lookup cache
    this._directionCache = this._initDirectionCache();
  }

  /**
   * Initialize cache for cell neighbor directions
   * This pre-calculates all neighbor positions for all cells
   *
   * @returns {Int16Array[][]} Array of direction arrays for each cell
   * @private
   */
  _initDirectionCache() {
    const cache = new Array(this.cellCount);

    for (let i = 0; i < this.cellCount; i++) {
      // For each cell, create a typed array for its 6 neighboring cells
      cache[i] = new Int16Array(6);

      for (let dir = 0; dir < 6; dir++) {
        cache[i][dir] = this.getNeighborPosition(i, dir);
      }
    }

    return cache;
  }

  /**
   * Calculate the position of a neighboring cell
   *
   * @param {number} position - Current cell position
   * @param {number} direction - Direction (0-5)
   * @returns {number} Neighbor position or -1 if out of bounds
   */
  getNeighborPosition(position, direction) {
    const x = position % this.width; // Get x coordinate from index
    const y = Math.floor(position / this.width); // Get y coordinate from index
    const f = y % 2; // Is this an odd-numbered row? (for offset)

    // Calculate offset based on direction and row parity
    let dx = 0; // x-offset to apply
    let dy = 0; // y-offset to apply

    switch (direction) {
      case 0:
        dx = f;
        dy = -1;
        break; // Upper right
      case 1:
        dx = 1;
        dy = 0;
        break; // Right
      case 2:
        dx = f;
        dy = 1;
        break; // Bottom right
      case 3:
        dx = f - 1;
        dy = 1;
        break; // Bottom left
      case 4:
        dx = -1;
        dy = 0;
        break; // Left
      case 5:
        dx = f - 1;
        dy = -1;
        break; // Upper left
    }

    // Apply offset to get new coordinates
    const newX = x + dx;
    const newY = y + dy;

    // Check if the new coordinates are out of bounds
    if (newX < 0 || newY < 0 || newX >= this.width || newY >= this.height) return -1;

    // Convert coordinates back to cell index
    return newY * this.width + newX;
  }

  /**
   * Get all directions as a typed array for a cell
   *
   * @param {number} position - Cell position
   * @returns {Int16Array} Array of neighbor positions (-1 for out of bounds)
   */
  getNeighborDirections(position) {
    return this._directionCache[position];
  }

  /**
   * Get the territory ID for a cell
   *
   * @param {number} position - Cell position
   * @returns {number} Territory ID (0 if not assigned)
   */
  getCellArea(position) {
    return this._cellToAreaMap[position];
  }

  /**
   * Set the territory ID for a cell
   *
   * @param {number} position - Cell position
   * @param {number} areaId - Territory ID
   */
  setCellArea(position, areaId) {
    this._cellToAreaMap[position] = areaId;
  }

  /**
   * Get the next flag value for a cell
   * Used during territory growth
   *
   * @param {number} position - Cell position
   * @returns {number} Flag value (0 or 1)
   */
  getNextFlag(position) {
    return this._nextFlags[position];
  }

  /**
   * Set the next flag value for a cell
   *
   * @param {number} position - Cell position
   * @param {number} value - Flag value (0 or 1)
   */
  setNextFlag(position, value) {
    this._nextFlags[position] = value;
  }

  /**
   * Reset all next flags to 0
   */
  resetNextFlags() {
    this._nextFlags.fill(0);
  }

  /**
   * Get the rcell value for a cell
   * Used to mark cells available for territory expansion
   *
   * @param {number} position - Cell position
   * @returns {number} Flag value (0 or 1)
   */
  getRCell(position) {
    return this._rCells[position];
  }

  /**
   * Set the rcell value for a cell
   *
   * @param {number} position - Cell position
   * @param {number} value - Flag value (0 or 1)
   */
  setRCell(position, value) {
    this._rCells[position] = value;
  }

  /**
   * Reset all rcell values to 0
   */
  resetRCells() {
    this._rCells.fill(0);
  }

  /**
   * Get the serial number for a cell
   * Used for randomization during map generation
   *
   * @param {number} position - Cell position
   * @returns {number} Serial number
   */
  getSerialNumber(position) {
    return this._serialNumbers[position];
  }

  /**
   * Set the serial number for a cell
   *
   * @param {number} position - Cell position
   * @param {number} value - Serial number
   */
  setSerialNumber(position, value) {
    this._serialNumbers[position] = value;
  }

  /**
   * Swap two serial numbers
   * Useful for efficient randomization
   *
   * @param {number} pos1 - First position
   * @param {number} pos2 - Second position
   */
  swapSerialNumbers(pos1, pos2) {
    const temp = this._serialNumbers[pos1];
    this._serialNumbers[pos1] = this._serialNumbers[pos2];
    this._serialNumbers[pos2] = temp;
  }

  /**
   * Randomize all serial numbers
   * Used during map generation
   */
  randomizeSerialNumbers() {
    for (let i = 0; i < this.cellCount; i++) {
      const r = Math.floor(Math.random() * this.cellCount);
      this.swapSerialNumbers(i, r);
    }
  }

  /**
   * Count cells assigned to each territory
   *
   * @param {number} maxAreaId - Maximum territory ID to count
   * @returns {Uint16Array} Array with counts for each territory
   */
  countCellsPerArea(maxAreaId) {
    const counts = new Uint16Array(maxAreaId + 1);

    for (let i = 0; i < this.cellCount; i++) {
      const areaId = this._cellToAreaMap[i];
      if (areaId > 0 && areaId <= maxAreaId) {
        counts[areaId]++;
      }
    }

    return counts;
  }

  /**
   * Legacy compatibility getter for cel array
   * Provides backward compatibility with original code
   */
  get cel() {
    // Create a regular array from the typed array for backward compatibility
    return Array.from(this._cellToAreaMap);
  }

  /**
   * Legacy compatibility setter for cel array
   */
  set cel(array) {
    if (!Array.isArray(array)) return;

    // Copy values from regular array to typed array
    for (let i = 0; i < Math.min(array.length, this.cellCount); i++) {
      this._cellToAreaMap[i] = array[i];
    }
  }

  /**
   * Legacy compatibility getter for num array
   */
  get num() {
    return Array.from(this._serialNumbers);
  }

  /**
   * Legacy compatibility setter for num array
   */
  set num(array) {
    if (!Array.isArray(array)) return;

    for (let i = 0; i < Math.min(array.length, this.cellCount); i++) {
      this._serialNumbers[i] = array[i];
    }
  }

  /**
   * Legacy compatibility getter for next_f array
   */
  get next_f() {
    return Array.from(this._nextFlags);
  }

  /**
   * Legacy compatibility setter for next_f array
   */
  set next_f(array) {
    if (!Array.isArray(array)) return;

    for (let i = 0; i < Math.min(array.length, this.cellCount); i++) {
      this._nextFlags[i] = array[i];
    }
  }

  /**
   * Legacy compatibility getter for rcel array
   */
  get rcel() {
    return Array.from(this._rCells);
  }

  /**
   * Legacy compatibility setter for rcel array
   */
  set rcel(array) {
    if (!Array.isArray(array)) return;

    for (let i = 0; i < Math.min(array.length, this.cellCount); i++) {
      this._rCells[i] = array[i];
    }
  }
}
