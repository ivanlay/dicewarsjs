/**
 * Bridge file for the ai_adaptive module
 * This enables backward compatibility with the older non-module code structure
 */

// Define the ai_adaptive function globally so it's accessible by the game
function ai_adaptive(game) {
    // Get current player number
    const pn = game.get_pn();
    
    // Simplified implementation that delegates to ai_default as a fallback when in bridge mode
    return ai_default(game);
}