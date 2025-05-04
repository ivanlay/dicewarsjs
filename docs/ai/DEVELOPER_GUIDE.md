# AI Developer Guide

This guide provides information on how to create custom AI implementations for the DiceWarsJS platform. It's designed to help developers understand the AI interface, game mechanics, and best practices for creating competitive AI strategies.

## Getting Started

### Basic Structure

Each AI implementation must export a single function with the following signature:

```javascript
/**
 * AI strategy function
 *
 * @param {Object} game - Game state object
 * @returns {Object|number} Action object or 0 to end turn
 */
export function ai_custom(game) {
  // Your AI implementation
}
```

The function should:

1. Analyze the current game state
2. Decide on an action to take
3. Return the action object or 0 to end the turn

### Examples

Look at the existing AI implementations to understand different approaches:

- **ai_example.js** - Simple random AI (good starting point)
- **ai_default.js** - Balanced strategy with basic territory evaluation
- **ai_defensive.js** - Focuses on defensive play and territory consolidation
- **ai_adaptive.js** - Adjusts strategy based on game phase and position

## Game State

The `game` object passed to your AI function provides access to the game state:

### Key Properties

- `game.adat` - Array of territory objects
- `game.player` - Array of player objects
- `game.get_pn()` - Get current player number
- `game.jun` - Array of player order
- `game.ban` - Current index in the player order

### Territory Information

Each territory (`game.adat[i]`) has these properties:

- `size` - Number of cells in the territory
- `arm` - Player ID who owns this territory (0-7)
- `dice` - Number of dice in this territory
- `join` - Array indicating adjacency to other territories

Example of accessing territory information:

```javascript
function ai_custom(game) {
  const pn = game.get_pn(); // My player number
  const myTerritories = [];

  // Find territories owned by this player
  for (let i = 1; i < game.adat.length; i++) {
    if (game.adat[i].arm === pn) {
      myTerritories.push(i);
    }
  }

  // Further decision logic...
}
```

## Making Decisions

Your AI should return an action or end its turn.

### Attack Action

To attack another territory, return an action object:

```javascript
return {
  from: fromTerritoryId,
  to: targetTerritoryId,
};
```

### End Turn

To end the turn without further actions, return 0:

```javascript
return 0;
```

## Strategy Considerations

When designing your AI, consider these elements:

### 1. Territory Evaluation

Territories have different strategic values based on:

- Size (number of cells)
- Position on the map
- Border with enemy territories
- Connection to other friendly territories

### 2. Attack Evaluation

Consider these factors when choosing attacks:

- Dice advantage (attacker vs defender)
- Strategic value of target territory
- Risk of counter-attack
- Effect on territorial integrity

### 3. Game Phases

The game typically has distinct phases that require different strategies:

- **Early Game**: Expand and establish position
- **Mid Game**: Consolidate territories and target weak opponents
- **Late Game**: Target leading players and secure strong positions

### 4. Player Analysis

Analyze other players to inform your strategy:

- Identify the strongest players (most territories/dice)
- Detect player positions (who borders whom)
- Observe player behavior patterns

## Recommended Patterns

### State Analysis

Analyze the game state efficiently:

```javascript
// Get all my territories
const myTerritories = [];
const enemyBorders = new Set();

for (let i = 1; i < game.adat.length; i++) {
  const area = game.adat[i];

  if (area.arm === pn) {
    myTerritories.push(i);

    // Find enemy neighbors
    for (let j = 1; j < area.join.length; j++) {
      if (area.join[j] === 1 && game.adat[j].arm !== pn) {
        enemyBorders.add(j);
      }
    }
  }
}
```

### Prioritizing Attacks

Evaluate and rank possible attacks:

```javascript
// Find all possible attacks
const possibleAttacks = [];

for (const fromId of myTerritories) {
  const from = game.adat[fromId];

  // Skip territories with only 1 die (can't attack)
  if (from.dice <= 1) continue;

  // Check all adjacent territories
  for (let toId = 1; toId < from.join.length; toId++) {
    if (from.join[toId] === 1) {
      const to = game.adat[toId];

      // Must be enemy territory
      if (to.arm === pn) continue;

      // Calculate attack score
      const diceAdvantage = from.dice - to.dice;
      const strategicValue = calculateStrategicValue(toId, game);
      const score = diceAdvantage * 5 + strategicValue;

      possibleAttacks.push({
        from: fromId,
        to: toId,
        score: score,
      });
    }
  }
}

// Sort by score and choose the best attack
possibleAttacks.sort((a, b) => b.score - a.score);

if (possibleAttacks.length > 0) {
  return {
    from: possibleAttacks[0].from,
    to: possibleAttacks[0].to,
  };
}

return 0; // End turn if no good attacks
```

## Performance Considerations

- Your AI has limited time to make decisions
- Optimize expensive calculations
- Consider caching results where appropriate
- Focus computation on promising moves

## Testing and Debugging

To test your AI:

1. Implement your strategy in a new file (e.g., `src/ai/ai_myCustom.js`)
2. Add your AI to the available AIs in `src/ai/index.js`
3. Update the configuration to use your AI
4. Run games against existing AIs to test performance

## Submission Guidelines

When the AI Championship Platform is ready, you'll be able to submit your AI through a web interface. For now:

1. Name your AI function descriptively (e.g., `ai_territorial`, `ai_aggressive`)
2. Include detailed comments explaining your strategy
3. Keep your code well-structured and readable
4. Include a brief strategy description in a comment block at the top

## Resources

- Existing AI implementations in `src/ai/`
- Game mechanics in `src/mechanics/`
- Test framework for AI performance testing in `tests/ai/`

## Future Enhancements

As the AI Championship Platform develops, we'll add:

- Standardized testing environments
- Performance metrics and analysis tools
- ELO rating system
- Tournament infrastructure
- Replay analysis tools

Happy coding, and may the most strategic AI win!
