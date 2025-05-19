/**
 * UI Bridge Module
 *
 * Exposes UI helper functions to the legacy global scope while
 * still providing ES6 module exports.
 */
import { drawPlayerData } from '../ui/playerStatus.js';

export { drawPlayerData };

try {
  // Provide global alias for legacy code
  window.draw_player_data = drawPlayerData;
  console.log('UI bridge module initialized');
} catch (err) {
  console.error('Failed to initialize UI bridge module', err);
}
