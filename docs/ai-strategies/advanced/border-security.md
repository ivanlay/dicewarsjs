# Border Security Strategy

The border security strategy focuses on protecting vulnerable territories at the edges of your domain while selectively attacking to improve your defensive position.

## Core Concept

The borders of your territory are your first line of defense. This strategy prioritizes:

1. Identifying vulnerable border territories
2. Avoiding attacks that would create new vulnerabilities
3. Targeting enemy territories that pose threats to your borders
4. Strengthening border territories with reinforcements

## Implementation Approach

Border security begins with identifying which territories are on the border:

```javascript
function isBorderTerritory(game, territory_id) {
  // A territory is on the border if it has at least one enemy neighbor
  for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size == 0) continue;
    if (!game.adat[territory_id].join[i]) continue;

    // If this neighbor belongs to a different player, this is a border territory
    if (game.adat[i].arm !== game.adat[territory_id].arm) {
      return true;
    }
  }
  return false;
}
```

## Example from ai_defensive.js

The defensive AI implements several border security strategies:

```javascript
// Skip if attacker doesn't have advantage (unless at max dice)
if (game.adat[i].dice >= game.adat[j].dice && game.adat[j].dice != 8) continue;

// Skip if winning would leave territory vulnerable to counter-attack
if (area_info[i].highest_friendly_neighbor_dice > game.adat[j].dice) continue;

// Skip if we have a large territory to protect and no reinforcements
if (game.player[pn].area_tc > 4
    && area_info[j].second_highest_unfriendly_neighbor_dice > 2
    && game.player[pn].stock == 0) continue;
```

## Border Security Tactics

### 1. Threat Assessment

Evaluate the threat level of border territories:

```javascript
function assessBorderThreat(game, territory_id, area_info) {
  // Higher number = higher threat
  let threat = 0;

  // More enemy neighbors = higher threat
  threat += area_info[territory_id].unfriendly_neighbors * 1.5;

  // Strong enemy neighbors = higher threat
  threat += area_info[territory_id].highest_unfriendly_neighbor_dice;
  threat += area_info[territory_id].second_highest_unfriendly_neighbor_dice * 0.5;

  // Few dice on this territory = higher threat
  threat += (8 - game.adat[territory_id].dice) * 0.75;

  // Few friendly neighbors = higher threat (less support)
  threat += (6 - area_info[territory_id].friendly_neighbors) * 0.5;

  return threat;
}
```

### 2. Safe Attack Identification

Identify attacks that won't compromise border security:

```javascript
// Prioritize attacks from territories with only one enemy neighbor
if (area_info[game.area_from].unfriendly_neighbors == 1) {
    if (area_info[j].unfriendly_neighbors == 1) {
        // If both have one enemy neighbor, prefer larger dice count
        if (game.adat[j].dice < game.adat[game.area_from].dice) continue;
        else if (game.adat[j].dice == game.adat[game.area_from].dice)
            // If equal dice, prefer less connected territory
            if (area_info[j].num_neighbors < area_info[game.area_from].num_neighbors)
                continue;
    } else continue; // Let the territory with one enemy neighbor attack first
}
```

### 3. Border Reinforcement Prioritization

```javascript
function prioritizeBorderReinforcements(game, area_info) {
  const candidates = [];

  // Consider all territories owned by current player
  const player = game.get_pn();
  for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size == 0) continue;
    if (game.adat[i].arm != player) continue;
    if (game.adat[i].dice >= 8) continue; // Already at max dice

    // Check if it's a border territory
    let isBorder = false;
    for (let j = 1; j < game.AREA_MAX; j++) {
      if (game.adat[j].size == 0) continue;
      if (!game.adat[i].join[j]) continue;
      if (game.adat[j].arm != player) {
        isBorder = true;
        break;
      }
    }

    if (isBorder) {
      // Calculate priority based on threat and strategic value
      const threat = assessBorderThreat(game, i, area_info);
      const diceNeeded = Math.min(8 - game.adat[i].dice, game.player[player].stock);

      candidates.push({
        territory: i,
        priority: threat * diceNeeded, // Higher threat and more dice needed = higher priority
        diceNeeded,
      });
    }
  }

  // Sort by priority (highest first)
  candidates.sort((a, b) => b.priority - a.priority);

  return candidates;
}
```

### 4. Border Expansion Planning

Identify strategic enemy territories to capture that would improve border security:

```javascript
function findBorderImprovingAttacks(game, area_info) {
  const attacks = [];
  const player = game.get_pn();

  // Check all possible attacks
  for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size == 0) continue;
    if (game.adat[i].arm != player) continue;
    if (game.adat[i].dice <= 1) continue;

    for (let j = 1; j < game.AREA_MAX; j++) {
      if (game.adat[j].size == 0) continue;
      if (game.adat[j].arm == player) continue;
      if (!game.adat[i].join[j]) continue;
      if (game.adat[j].dice >= game.adat[i].dice) continue;

      // Calculate how this attack would affect our border
      let currentBorderCount = 0;
      let newBorderCount = 0;

      // Count current border territories
      for (let k = 1; k < game.AREA_MAX; k++) {
        if (game.adat[k].size == 0) continue;
        if (game.adat[k].arm != player) continue;

        if (isBorderTerritory(game, k)) {
          currentBorderCount++;
        }
      }

      // Simulate the attack
      const originalArm = game.adat[j].arm;
      game.adat[j].arm = player;

      // Count new border territories
      for (let k = 1; k < game.AREA_MAX; k++) {
        if (game.adat[k].size == 0) continue;
        if (game.adat[k].arm != player) continue;

        if (isBorderTerritory(game, k)) {
          newBorderCount++;
        }
      }

      // Restore original state
      game.adat[j].arm = originalArm;

      // If this attack reduces our border or creates a stronger border
      if (newBorderCount <= currentBorderCount) {
        attacks.push({
          from: i,
          to: j,
          borderReduction: currentBorderCount - newBorderCount,
          diceAdvantage: game.adat[i].dice - game.adat[j].dice,
        });
      }
    }
  }

  // Sort by border improvement and dice advantage
  attacks.sort((a, b) => {
    if (a.borderReduction !== b.borderReduction) {
      return b.borderReduction - a.borderReduction;
    }
    return b.diceAdvantage - a.diceAdvantage;
  });

  return attacks;
}
```

## When to Use

The border security strategy is particularly effective:

1. In the middle and late stages of the game
2. When you have a significant territory to protect
3. When facing multiple opponents
4. When you want to play defensively but still make strategic attacks

## Combining with Other Strategies

Border security pairs well with:

1. **Neighbor analysis** - Provides the data needed for border threat assessment
2. **Territory connections** - Reinforces the importance of connected territories
3. **Reinforcement optimization** - Ensures reinforcements go to critical border areas
4. **Choke point control** - Identifies critical territories that control access to your domain
