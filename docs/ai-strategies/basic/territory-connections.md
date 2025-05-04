# Territory Connections Strategy

The territory connections strategy focuses on maintaining and expanding connected territories to maximize reinforcement dice at the end of each turn.

## Core Concept

In Dice Wars, players receive reinforcement dice based on the size of their largest connected territory group. This strategy prioritizes moves that maintain or expand these connections.

## Game Mechanic

The `set_area_tc` function in the game calculates a player's largest connected territory:

```javascript
set_area_tc(pn) {
  // ...
  // Find the largest connected group for a player
  // ...
  // Store the size of the largest connected group
  this.player[pn].area_tc = max;
}
```

## Implementation

This strategy has two main components:

1. **Avoid breaking connections** - Prevent attacks that could lead to disconnected territories
2. **Target strategic connections** - Prioritize attacks that connect or expand territory groups

```javascript
// Example: Defensive consideration for territory size
if (game.player[pn].area_tc > 4
    && area_info[j].second_highest_unfriendly_neighbor_dice > 2
    && game.player[pn].stock == 0) continue;
```

## Example from ai_defensive.js

The defensive AI considers territory connections when deciding whether to attack:

```javascript
// Skip if we have a large territory to protect and no reinforcements
if (game.player[pn].area_tc > 4
    && area_info[j].second_highest_unfriendly_neighbor_dice > 2
    && game.player[pn].stock == 0) continue;
```

This logic avoids risky attacks when the AI already has a substantial connected territory (more than 4 territories) but no reinforcement dice in reserve, especially if there are strong enemy territories nearby.

## Strategic Importance

Understanding connected territories is crucial because:

1. **Reinforcement source** - Larger connected territories provide more reinforcement dice
2. **Defensive strength** - Connected territories are easier to defend with reinforcements
3. **Supply lines** - Connected territories allow for strategic deployment of dice
4. **Expansion potential** - Connected territories provide more options for future expansion

## Implementation Techniques

There are several ways to implement territory connection analysis:

1. **Graph algorithms** - Use union-find or graph traversal to identify connected components
2. **Connection metrics** - Calculate a "connectedness score" for potential moves
3. **Bridge identification** - Identify and protect "bridge" territories that connect larger groups
4. **Expansion planning** - Target territories that would connect separate groups

## Example: Finding Bridge Territories

Bridge territories are critical connections that, if lost, would split your territory into disconnected parts:

```javascript
function findBridgeTerritories(game, player) {
  const bridges = [];

  // For each territory owned by the player
  for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size == 0) continue;
    if (game.adat[i].arm != player) continue;

    // Simulate removing this territory
    const originalArm = game.adat[i].arm;
    game.adat[i].arm = -1;

    // Calculate connected territories without this one
    const originalSize = game.player[player].area_tc;
    game.set_area_tc(player);
    const newSize = game.player[player].area_tc;

    // If removing this territory reduces the connected size, it's a bridge
    if (newSize < originalSize - 1) {
      bridges.push(i);
    }

    // Restore the territory
    game.adat[i].arm = originalArm;
  }

  // Restore the original connected territory calculation
  game.set_area_tc(player);

  return bridges;
}
```

## When to Use

This strategy is particularly effective:

1. In the mid to late game when territory groups have formed
2. When facing aggressive opponents who might split your territories
3. When reinforcement dice are crucial to your overall strategy

## Combining with Other Strategies

Territory connection analysis works well with:

1. **Border security** - Protect the perimeter of your connected territories
2. **Choke point control** - Identify and control narrow passages between territory groups
3. **Expansion planning** - Target key territories that would connect separate groups
