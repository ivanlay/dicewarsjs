# Random Selection Strategy

The random selection strategy is a simple approach where the AI selects randomly from all valid moves. While basic, it adds unpredictability and can be effective as part of a larger strategy.

## Core Concept

After identifying all valid moves (typically attacks with a dice advantage), randomly select one rather than trying to determine the "best" move. This introduces unpredictability to your AI.

## Implementation

```javascript
// Randomly select a move from the valid options
const n = Math.floor(Math.random() * number_of_moves);
const move = list_moves[n];

// Set the selected move in the game state
game.area_from = move['attacker'];
game.area_to = move['defender'];
```

## Example from ai_default.js

```javascript
// Build list of valid attacks
for (let i = 1; i < game.AREA_MAX; i++) {
  // [Code that finds valid moves and adds them to list_from and list_to arrays]
  // ...
}

// End turn if no valid attacks found
if (lc == 0) return 0;

// Choose a random valid attack from the list
const n = Math.floor(Math.random() * lc);
game.area_from = list_from[n];
game.area_to = list_to[n];
```

## Advantages

1. **Simplicity** - Easy to implement with minimal computational overhead
2. **Unpredictability** - Makes your AI's behavior less predictable
3. **Coverage** - Over time, all possible moves will be considered

## Disadvantages

1. **Sub-optimal** - May select strategically poor moves when better options exist
2. **No learning** - Doesn't adapt to the game state or opponent behavior
3. **Inconsistent** - May perform very differently from game to game

## Enhancements

While basic random selection uses uniform probability, consider these variations:

1. **Weighted randomization** - Assign higher probabilities to moves with greater strategic value
2. **Biased randomization** - Incorporate a bias toward certain types of moves (e.g., consolidating territory)
3. **Bounded randomness** - First filter for "good enough" moves, then randomly select from that subset

## When to Use

Random selection works well in these scenarios:

1. As a fallback when more complex strategic evaluation is inconclusive
2. In the early game when the board state is still developing
3. When you want to add unpredictability to an otherwise deterministic AI

## Example Hybrid Approach

```javascript
// First, identify all moves with at least a 2-dice advantage
const strongMoves = findMovesWithStrengthAdvantage(game, 2);

// If we have strong moves, pick one randomly
if (strongMoves.length > 0) {
  const index = Math.floor(Math.random() * strongMoves.length);
  return strongMoves[index];
}

// Otherwise, fall back to any valid move with a dice advantage
const validMoves = findAllValidMoves(game);
if (validMoves.length > 0) {
  const index = Math.floor(Math.random() * validMoves.length);
  return validMoves[index];
}

// No valid moves, end turn
return 0;
```
