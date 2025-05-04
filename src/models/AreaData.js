/**
 * Area Data Structure
 *
 * Represents a territory on the game map. Contains information about:
 * - Size and position
 * - Ownership (player/army)
 * - Dice count
 * - Border information for rendering
 * - Adjacency to other territories
 */
export class AreaData {
  constructor() {
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

    // Border drawing information
    this.line_cel = new Array(100); // Border cell indices
    this.line_dir = new Array(100); // Border directions (0-5 for hexagonal grid)

    // Adjacency array - indices of areas that share a border with this area
    // Used for determining valid attack targets and territory groups
    this.join = Array(32).fill(0); // 32 possible adjacent territories
  }
}
