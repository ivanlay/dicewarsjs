/**
 * Player Data Structure
 *
 * Tracks a player's game state, including:
 * - Territory ownership
 * - Dice counts and reinforcements
 * - Game ranking
 */
export class PlayerData {
  constructor() {
    this.area_c = 0; // Number of areas owned
    this.area_tc = 0; // Size of largest connected territory group
    this.dice_c = 0; // Total number of dice across all territories
    this.dice_jun = 0; // Dice count ranking among players
    this.stock = 0; // Reinforcement dice available for distribution
  }
}
