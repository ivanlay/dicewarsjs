/**
 * History Data Structure
 * 
 * Records an action for replay and history tracking.
 * Each entry represents either an attack or a reinforcement.
 */
export class HistoryData {
  constructor() {
    this.from = 0;  // Source area (for attack or reinforcement)
    this.to = 0;    // Target area (for attack) or 0 for reinforcement
    this.res = 0;   // Result: 0=attack failed, 1=attack succeeded
  }
}