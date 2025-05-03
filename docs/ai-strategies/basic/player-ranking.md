# Player Ranking Strategy

The player ranking strategy involves analyzing and ranking opponents based on their strength, then adjusting your AI's behavior accordingly. This helps focus attacks on the strongest threats or weakest opponents.

## Core Concept

Calculate a "strength ranking" for each player (typically based on total dice count) and use this information to make strategic decisions about which players to attack or defend against.

## Implementation

```javascript
// Calculate dice ranking for each player (0 = highest rank)
for (let i = 0; i < 8; i++) game.player[i].dice_jun = i;
for (let i = 0; i < 8 - 1; i++) {
    for (let j = i + 1; j < 8; j++) {
        if (game.player[i].dice_c < game.player[j].dice_c) {
            const tmp = game.player[i].dice_jun;
            game.player[i].dice_jun = game.player[j].dice_jun;
            game.player[j].dice_jun = tmp;
        }
    }
}
```

## Example from ai_default.js

```javascript
// Count total dice and territories for each player
let sum = 0;
for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size == 0) continue;
    const arm = game.adat[i].arm;
    game.player[arm].area_c++;
    game.player[arm].dice_c += game.adat[i].dice;
    sum += game.adat[i].dice;
}

// Calculate dice ranking for each player (0 = highest rank)
for (let i = 0; i < 8; i++) game.player[i].dice_jun = i;
for (let i = 0; i < 8 - 1; i++) {
    for (let j = i + 1; j < 8; j++) {
        if (game.player[i].dice_c < game.player[j].dice_c) {
            const tmp = game.player[i].dice_jun;
            game.player[i].dice_jun = game.player[j].dice_jun;
            game.player[j].dice_jun = tmp;
        }
    }
}

// Identify if there's a dominant player (>40% of total dice)
let top = -1;
for (let i = 0; i < 8; i++) {
    if (game.player[i].dice_c > sum * 2 / 5) top = i;
}

// Handle equal dice situations based on player ranking
if (game.adat[j].dice == game.adat[i].dice) {
    const en = game.adat[j].arm;
    let f = 0;
    if (game.player[pn].dice_jun == 0) f = 1;  // Attack if we're top ranked
    if (game.player[en].dice_jun == 0) f = 1;  // Attack if opponent is top ranked
    // ...
}

// If there's a dominant player, only consider attacks involving them
if (top >= 0) {
    if (game.adat[i].arm != top && game.adat[j].arm != top) continue;
}
```

## Ranking Metrics

You can rank players using various metrics:

1. **Total dice count** - The sum of all dice across a player's territories
2. **Territory count** - The number of territories a player controls
3. **Connected territory size** - The size of a player's largest connected territory group
4. **Border pressure** - How many enemy territories border a player's territories
5. **Composite score** - A weighted combination of multiple metrics

## Strategic Applications

Once you have player rankings, you can apply them in several ways:

1. **Target the leader** - Focus attacks on the highest-ranked player to prevent them from dominating
2. **Opportunistic expansion** - Focus attacks on the lowest-ranked players for easier conquests
3. **Defensive posture** - Prioritize defense when your rank is high
4. **Risk assessment** - Take more risks when attacking lower-ranked players

## Dominant Player Strategy

A special case is detecting a "dominant" player who controls a large portion of the board's resources:

```javascript
// Identify if there's a dominant player (>40% of total dice)
let top = -1;
for (let i = 0; i < 8; i++) {
    if (game.player[i].dice_c > sum * 2 / 5) top = i;
}

// If there's a dominant player, only consider attacks involving them
if (top >= 0) {
    if (game.adat[i].arm != top && game.adat[j].arm != top) continue;
}
```

This focuses all attention on either attacking or defending against the dominant player.

## Enhancements

1. **Dynamic thresholds** - Adjust the definition of "dominant" based on the game state
2. **Multi-level targeting** - Create a full priority list instead of just identifying the top player
3. **Temporal tracking** - Track how rankings change over time to identify emerging threats

## When to Use

Player ranking is most effective:

1. In mid to late game when player strengths have differentiated
2. In multiplayer games (3+ players) where targeting decisions matter
3. As part of a broader strategic framework that considers multiple factors