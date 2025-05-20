// Legacy game.js now re-exports the modern Game class
// and exposes it to the global scope for backwards compatibility.
import { Game } from './src/Game.js';

if (typeof window !== 'undefined') {
  window.Game = Game;
}

export { Game };
export default Game;
