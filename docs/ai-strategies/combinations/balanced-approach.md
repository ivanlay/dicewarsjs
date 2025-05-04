# Balanced Approach

A balanced approach combines offensive and defensive strategies to create a well-rounded AI that can adapt to different game situations.

## Core Concept

The balanced approach doesn't fully commit to either aggressive expansion or defensive consolidation. Instead, it evaluates both options and chooses the most promising based on the current game state.

## Strategy Components

### 1. Dice Advantage Assessment

Use the basic dice advantage strategy as a foundation:

```javascript
// Only consider attacks where attacker has more dice than defender
if (defending_area.dice >= attacking_area.dice) continue;
```

### 2. Player Ranking

Incorporate player ranking to identify threats and opportunities:

```javascript
// Calculate dice ranking for each player
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

// Identify if there's a dominant player
let top = -1;
for (let i = 0; i < 8; i++) {
  if (game.player[i].dice_c > (sum * 2) / 5) top = i;
}
```

### 3. Neighbor Analysis

Add strategic depth with neighbor analysis:

```javascript
function area_get_info(area_id) {
  // ... (implementation from neighbor-analysis.md)
  return {
    friendly_neighbors,
    unfriendly_neighbors,
    highest_friendly_neighbor_dice,
    highest_unfriendly_neighbor_dice,
    second_highest_unfriendly_neighbor_dice,
    num_neighbors,
  };
}

// Pre-compute neighbor information for all territories
const area_info = [...Array(game.AREA_MAX).keys()].map(area_get_info);
```

### 4. Border Security Evaluation

Add defensive considerations:

```javascript
// Skip if winning would leave territory vulnerable to counter-attack
if (area_info[i].highest_friendly_neighbor_dice > game.adat[j].dice) continue;
```

### 5. Reinforcement Awareness

Consider reinforcement implications:

```javascript
// Skip if we have a large territory to protect and no reinforcements
if (game.player[pn].area_tc > 4
    && area_info[j].second_highest_unfriendly_neighbor_dice > 2
    && game.player[pn].stock == 0) continue;
```

## Implementation Example

```javascript
function ai_balanced(game) {
  // Get current player number
  const pn = game.get_pn();

  // Pre-compute neighbor information for all territories
  const area_info = [...Array(game.AREA_MAX).keys()].map(area => area_get_info(game, area));

  // Calculate player rankings
  calculatePlayerRankings(game);

  // Identify dominant player
  const dominantPlayer = identifyDominantPlayer(game);

  // Evaluate our position
  const ourPosition = evaluatePosition(game, pn, area_info);

  // Decide whether to play offensively or defensively based on position
  const strategy = selectStrategy(game, ourPosition, dominantPlayer, pn);

  // Generate potential moves based on strategy
  const moves = generateMoves(game, pn, area_info, strategy, dominantPlayer);

  // No valid moves, end turn
  if (moves.length === 0) return 0;

  // Choose the best move based on strategy
  const bestMove = selectBestMove(moves, strategy);

  // Execute the move
  game.area_from = bestMove.from;
  game.area_to = bestMove.to;
}

function evaluatePosition(game, player, area_info) {
  // Calculate various metrics to evaluate our position

  // Count our territories
  let territoriesOwned = 0;
  for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size === 0) continue;
    if (game.adat[i].arm === player) territoriesOwned++;
  }

  // Count border territories
  let borderTerritories = 0;
  for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size === 0) continue;
    if (game.adat[i].arm !== player) continue;

    if (area_info[i].unfriendly_neighbors > 0) {
      borderTerritories++;
    }
  }

  // Calculate border pressure (higher = more threatened)
  let borderPressure = 0;
  for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size === 0) continue;
    if (game.adat[i].arm !== player) continue;

    if (area_info[i].unfriendly_neighbors > 0) {
      borderPressure += area_info[i].highest_unfriendly_neighbor_dice - game.adat[i].dice;
    }
  }

  // Calculate average dice per territory
  let totalDice = 0;
  for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size === 0) continue;
    if (game.adat[i].arm !== player) continue;

    totalDice += game.adat[i].dice;
  }
  const averageDice = territoriesOwned > 0 ? totalDice / territoriesOwned : 0;

  return {
    territoriesOwned,
    borderTerritories,
    borderPressure,
    totalDice,
    averageDice,
    connectedSize: game.player[player].area_tc,
    ranking: game.player[player].dice_jun,
  };
}

function selectStrategy(game, position, dominantPlayer, player) {
  // The balanced approach adapts strategy based on game state
  let strategy = {
    offensive: 0.5, // 0-1 scale, higher = more offensive
    defensive: 0.5, // 0-1 scale, higher = more defensive
    targetDominant: false,
    consolidate: false,
  };

  // If we're the dominant player, play more defensively
  if (dominantPlayer === player) {
    strategy.offensive = 0.3;
    strategy.defensive = 0.7;
  }

  // If there's a dominant player but it's not us, target them
  else if (dominantPlayer !== -1) {
    strategy.offensive = 0.7;
    strategy.defensive = 0.3;
    strategy.targetDominant = true;
  }

  // If we're under pressure, play more defensively
  if (position.borderPressure > 0) {
    strategy.defensive += 0.2;
    strategy.offensive -= 0.2;
  }

  // If we have a strong position, play more offensively
  if (position.ranking === 0 || position.averageDice > 4) {
    strategy.offensive += 0.2;
    strategy.defensive -= 0.2;
  }

  // If our territories are fragmented, focus on consolidation
  if (position.territoriesOwned > position.connectedSize * 1.5) {
    strategy.consolidate = true;
  }

  // Ensure values stay in range
  strategy.offensive = Math.max(0, Math.min(1, strategy.offensive));
  strategy.defensive = 1 - strategy.offensive;

  return strategy;
}

function generateMoves(game, player, area_info, strategy, dominantPlayer) {
  const moves = [];

  // Check all possible attacks
  for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size === 0) continue;
    if (game.adat[i].arm !== player) continue;
    if (game.adat[i].dice <= 1) continue;

    for (let j = 1; j < game.AREA_MAX; j++) {
      if (game.adat[j].size === 0) continue;
      if (game.adat[j].arm === player) continue;
      if (!game.adat[i].join[j]) continue;

      // Basic dice advantage check
      if (game.adat[j].dice >= game.adat[i].dice) continue;

      // Defensive checks (if we're playing defensively)
      if (strategy.defensive > 0.5) {
        // Skip if winning would leave territory vulnerable to counter-attack
        if (area_info[i].highest_unfriendly_neighbor_dice > game.adat[j].dice) continue;

        // Skip if we have a large territory to protect and no reinforcements
        if (
          game.player[player].area_tc > 4 &&
          area_info[j].second_highest_unfriendly_neighbor_dice > 2 &&
          game.player[player].stock === 0
        )
          continue;
      }

      // If targeting dominant player, prioritize attacks against them
      if (strategy.targetDominant && dominantPlayer !== -1) {
        if (game.adat[j].arm !== dominantPlayer) {
          // We'll still consider other attacks, but with lower priority
        }
      }

      // Calculate the move's value based on current strategy
      const offensiveValue = calculateOffensiveValue(game, i, j, area_info);
      const defensiveValue = calculateDefensiveValue(game, i, j, area_info);

      // Weighted value based on strategy balance
      const value = offensiveValue * strategy.offensive + defensiveValue * strategy.defensive;

      // Add to potential moves
      moves.push({
        from: i,
        to: j,
        value: value,
        diceAdvantage: game.adat[i].dice - game.adat[j].dice,
      });
    }
  }

  // Sort by value (highest first)
  moves.sort((a, b) => b.value - a.value);

  return moves;
}

function calculateOffensiveValue(game, from, to, area_info) {
  let value = 0;

  // Base value is dice advantage
  value += game.adat[from].dice - game.adat[to].dice;

  // Bonus for attacking territories with high dice counts
  value += game.adat[to].dice * 0.5;

  // Bonus for attacking territories with many adjacent territories (expansion potential)
  value += area_info[to].num_neighbors * 0.3;

  // Bonus for attacking top-ranked players
  const targetPlayer = game.adat[to].arm;
  if (game.player[targetPlayer].dice_jun === 0) value += 2;
  if (game.player[targetPlayer].dice_jun === 1) value += 1;

  return value;
}

function calculateDefensiveValue(game, from, to, area_info) {
  let value = 0;

  // Base value is dice advantage (safety of the attack)
  value += game.adat[from].dice - game.adat[to].dice;

  // Lower value if attacking from a vulnerable territory
  if (area_info[from].unfriendly_neighbors > 1) {
    value -= area_info[from].unfriendly_neighbors * 0.5;
  }

  // Higher value if attacking from a territory with only one enemy neighbor
  if (area_info[from].unfriendly_neighbors === 1) {
    value += 2;
  }

  // Higher value if capturing would reduce our exposed border
  const borderReduction = calculateBorderReduction(game, from, to);
  value += borderReduction * 2;

  return value;
}

function selectBestMove(moves, strategy) {
  // In a truly balanced approach, we might sometimes choose a lower-ranked move
  // for variety, but with a bias toward higher-valued moves

  if (moves.length === 0) return null;

  // Usually pick the best move
  if (Math.random() < 0.8) {
    return moves[0];
  }

  // Sometimes pick a random move from the top 3
  const topMoves = moves.slice(0, Math.min(3, moves.length));
  return topMoves[Math.floor(Math.random() * topMoves.length)];
}
```

## Adapting to Game Phase

A balanced AI adjusts its strategy based on the game phase:

### Early Game

```javascript
if (isEarlyGame(game)) {
  // Focus on expansion
  strategy.offensive += 0.2;

  // Prioritize grabbing territories with high connectivity
  // ...
}
```

### Mid Game

```javascript
if (isMidGame(game)) {
  // Balance between offense and defense

  // Consider player rankings
  // ...

  // Focus on territory consolidation
  if (needsConsolidation(game, player)) {
    strategy.consolidate = true;
  }
}
```

### Late Game

```javascript
if (isLateGame(game)) {
  // Identify remaining opponents
  const remainingPlayers = countRemainingPlayers(game);

  if (remainingPlayers === 2) {
    // 1v1 situation - pure strategy based on relative strength
    if (hasAdvantage(game, player)) {
      strategy.offensive = 0.8; // Press the advantage
    } else {
      strategy.defensive = 0.8; // Play defensively, wait for mistakes
    }
  } else {
    // Multi-player end game
    // Target the weakest remaining player
    strategy.targetWeakest = true;
  }
}
```

## Combining with Equal Dice Considerations

From the default AI, we can incorporate logic for equal dice situations:

```javascript
// Handle equal dice situations
if (game.adat[j].dice == game.adat[i].dice) {
    const en = game.adat[j].arm;
    let f = 0;
    if (game.player[pn].dice_jun == 0) f = 1;  // Attack if we're top ranked
    if (game.player[en].dice_jun == 0) f = 1;  // Attack if opponent is top ranked
    if (Math.random() * 10 > 1) f = 1;  // 90% chance to attack in equal dice situations
    if (f == 0) continue;
}
```

## When to Use

The balanced approach is ideal for:

1. General-purpose AI that needs to handle a variety of game situations
2. Maps with mixed terrain that requires both offensive and defensive play
3. When you want a robust AI that doesn't have easily exploitable weaknesses
4. As a foundation for more specialized strategies

## Advantages

1. **Adaptability** - Can adjust to changing game situations
2. **Robustness** - No single critical weakness
3. **Learning curve** - Easier to understand and implement than highly specialized strategies
4. **Emergent behavior** - Can create interesting emergent gameplay patterns
