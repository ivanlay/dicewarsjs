/**
 * Join Data Structure
 * 
 * Contains adjacency information for a cell in the hexagonal grid.
 * Each cell can have up to 6 neighbors in the directions:
 * 0=upper right, 1=right, 2=bottom right, 
 * 3=bottom left, 4=left, 5=upper left
 */
export class JoinData {
  constructor() {
    this.dir = [0, 0, 0, 0, 0, 0];  // Array of indices to adjacent cells
  }
}