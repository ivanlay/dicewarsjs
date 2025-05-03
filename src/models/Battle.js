/**
 * Battle Data Structure
 * 
 * Holds data for dice battle visualization and resolution.
 * Each battle consists of two sides rolling dice and comparing values.
 */
export class Battle {
  constructor() {
    this.dn = 0;                 // Dice number (position to stop)
    this.arm = 0;                // Player/army affiliation (color)
    this.dmax = 0;               // Number of dice in this battle
    this.deme = [0, 0, 0, 0, 0, 0, 0, 0];  // Actual values rolled for each die
    this.sum = 0;                // Total sum of dice values
    this.fin = [0, 0, 0, 0, 0, 0, 0, 0];   // Animation finished flags for each die
    this.usedice = [0, 1, 2, 3, 4, 5, 6, 7]; // Dice indices to use (shuffled for animation)
  }
}