# Reinforcement Optimization Strategy

The reinforcement optimization strategy focuses on making the most effective use of reinforcement dice granted at the end of each turn. Strategic allocation of these dice can significantly impact your game position.

## Core Concept

In Dice Wars, players receive reinforcement dice based on their largest connected territory. This strategy involves:

1. Understanding how reinforcements are calculated
2. Identifying the most strategically valuable territories for reinforcement
3. Using reinforcement anticipation in attack planning
4. Possibly foregoing attacks to preserve advantageous reinforcement positions

## Game Mechanics for Reinforcements

```javascript
// In the game engine, reinforcements are based on the largest connected territory
set_area_tc(pn) {
  // ...logic to find the largest connected territory group...
  this.player[pn].area_tc = max;
}
```

Players receive reinforcement dice proportional to the size of their largest connected territory group.

## Implementation Approach

### 1. Reinforcement Prediction

```javascript
function predictReinforcements(game, player) {
  // Calculate connected territory size
  let originalAreaTC = game.player[player].area_tc;

  // The game likely has a specific formula for reinforcement calculation
  // This is a simplified example - replace with the actual formula
  const expectedReinforcements = Math.floor(originalAreaTC / 2);

  return {
    territorySize: originalAreaTC,
    expectedDice: expectedReinforcements,
  };
}
```

### 2. Strategic Territory Identification

Identify territories that would benefit most from reinforcements:

```javascript
function identifyReinforcementCandidates(game, area_info) {
  const player = game.get_pn();
  const candidates = [];

  // Check all owned territories
  for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size == 0) continue;
    if (game.adat[i].arm != player) continue;
    if (game.adat[i].dice >= 8) continue; // Already at max dice

    let score = 0;

    // Border territories are more valuable for reinforcement
    if (area_info[i].unfriendly_neighbors > 0) {
      score += 3; // Base points for being on the border

      // More enemy neighbors = higher priority
      score += area_info[i].unfriendly_neighbors * 1.5;

      // Strong enemy neighbors = higher priority
      score += area_info[i].highest_unfriendly_neighbor_dice * 0.5;

      // Few dice = higher priority
      score += (8 - game.adat[i].dice) * 0.75;

      // Strategic territories (like choke points) get bonus points
      if (isChokePoint(game, i)) {
        score += 5;
      }

      // Territories that could be used for strong attacks next turn
      if (hasStrongAttackPotential(game, i)) {
        score += 4;
      }
    }

    candidates.push({
      territory: i,
      score: score,
      currentDice: game.adat[i].dice,
      maxReinforcement: 8 - game.adat[i].dice,
    });
  }

  // Sort by score (highest first)
  candidates.sort((a, b) => b.score - a.score);

  return candidates;
}

function isChokePoint(game, territory) {
  // Implementation from the Choke Point Control strategy
  // ...
}

function hasStrongAttackPotential(game, territory) {
  // Check if this territory is adjacent to valuable enemy territories
  const player = game.get_pn();

  for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size == 0) continue;
    if (game.adat[i].arm == player) continue;
    if (!game.adat[territory].join[i]) continue;

    // If adding dice would create a strong attack opportunity
    if (game.adat[territory].dice + 2 > game.adat[i].dice + 1) {
      return true;
    }
  }

  return false;
}
```

### 3. Attack Planning with Reinforcement Consideration

```javascript
function evaluateAttackWithReinforcementImpact(game, from, to) {
  const player = game.get_pn();

  // Calculate current reinforcement expectation
  const currentReinforcement = predictReinforcements(game, player);

  // Simulate the attack
  const originalToOwner = game.adat[to].arm;
  const originalToDice = game.adat[to].dice;
  const originalFromDice = game.adat[from].dice;

  // Assume attack success
  game.adat[to].arm = player;
  game.adat[to].dice = originalFromDice - 1;
  game.adat[from].dice = 1;

  // Calculate new reinforcement expectation
  const newReinforcement = predictReinforcements(game, player);

  // Restore original state
  game.adat[to].arm = originalToOwner;
  game.adat[to].dice = originalToDice;
  game.adat[from].dice = originalFromDice;

  // Calculate the net impact
  const reinforcementChange = newReinforcement.expectedDice - currentReinforcement.expectedDice;

  return {
    from: from,
    to: to,
    diceAdvantage: originalFromDice - originalToDice,
    reinforcementChange: reinforcementChange,
    // Higher scores for attacks that maintain or increase reinforcements
    score: originalFromDice - originalToDice + reinforcementChange * 2,
  };
}
```

### 4. Deployment Optimization

```javascript
function optimizeReinforcementDeployment(game, reinforcementAmount) {
  const candidates = identifyReinforcementCandidates(game, calculateAreaInfo(game));
  const deploymentPlan = [];
  let remainingDice = reinforcementAmount;

  // Allocate dice in order of priority until we run out
  for (const candidate of candidates) {
    if (remainingDice <= 0) break;

    // How many dice to allocate to this territory
    const allocation = Math.min(
      candidate.maxReinforcement, // Don't exceed max dice (8)
      remainingDice, // Don't allocate more than we have
      calculateOptimalDiceForTerritory(game, candidate.territory) // Don't over-allocate
    );

    if (allocation > 0) {
      deploymentPlan.push({
        territory: candidate.territory,
        allocation: allocation,
      });

      remainingDice -= allocation;
    }
  }

  return deploymentPlan;
}

function calculateOptimalDiceForTerritory(game, territory) {
  // Calculate the optimal number of dice for this territory based on threats
  // and attack opportunities
  const area_info = calculateAreaInfo(game);

  // Start with the current threats
  let optimalDice = area_info[territory].highest_unfriendly_neighbor_dice + 1;

  // Consider attack opportunities
  for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size == 0) continue;
    if (game.adat[i].arm == game.adat[territory].arm) continue;
    if (!game.adat[territory].join[i]) continue;

    // If attacking this territory would be valuable
    if (isValuableTarget(game, i)) {
      // We'd want enough dice to have a strong advantage
      const diceNeededForAttack = game.adat[i].dice + 2;
      if (diceNeededForAttack > optimalDice) {
        optimalDice = diceNeededForAttack;
      }
    }
  }

  // Cap at maximum dice
  return Math.min(optimalDice, 8);
}

function isValuableTarget(game, territory) {
  // Determine if a territory is a valuable target
  // Could consider: choke points, connected territory impact, etc.
  // ...
}
```

## Strategic Considerations

### 1. Reinforcement vs. Immediate Attack

Sometimes it's better to forego an attack to maintain a stronger reinforcement position:

```javascript
function shouldForgoAttackForReinforcements(game, from, to) {
  const attackEvaluation = evaluateAttackWithReinforcementImpact(game, from, to);

  // If this attack would significantly decrease our reinforcements
  if (attackEvaluation.reinforcementChange < -1) {
    // Only worth it if we have a massive dice advantage or the target is extremely valuable
    if (attackEvaluation.diceAdvantage <= 3 && !isExtremelyValuableTarget(game, to)) {
      return true; // Should forego the attack
    }
  }

  return false; // Attack is worth it
}
```

### 2. Territory Consolidation

Sometimes expanding your largest connected territory is more valuable than making tactically successful attacks:

```javascript
function findConsolidationAttacks(game) {
    const player = game.get_pn();
    const consolidationTargets = [];

    // Find the largest connected group
    game.set_area_tc(player);
    const largestGroupSize = game.player[player].area_tc;

    // Initialize territory group tracking
    for (let i = 0; i < game.AREA_MAX; i++) game.chk[i] = i;

    // Identify which territories belong to the largest group
    // ... (implement group identification logic) ...

    // Look for attacks that would connect separate territory groups
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size == 0) continue;
        if (game.adat[i].arm != player) continue;
        if (game.adat[i].dice <= 1) continue;

        // Check if this territory is NOT in the largest group
        const isInLargestGroup = /* determine if in largest group */;

        for (let j = 1; j < game.AREA_MAX; j++) {
            if (game.adat[j].size == 0) continue;
            if (game.adat[j].arm == player) continue;
            if (!game.adat[i].join[j]) continue;

            // Check if capturing this would connect to the largest group
            const wouldConnectToLargestGroup = /* logic to determine */;

            if (wouldConnectToLargestGroup && game.adat[i].dice > game.adat[j].dice) {
                consolidationTargets.push({
                    from: i,
                    to: j,
                    diceAdvantage: game.adat[i].dice - game.adat[j].dice,
                    // Higher priority for attacks that connect larger separate groups
                    priority: (game.adat[i].dice - game.adat[j].dice) +
                              (/* size of group being connected */ * 2)
                });
            }
        }
    }

    return consolidationTargets;
}
```

## When to Use

Reinforcement optimization is most effective:

1. In the mid to late game when territory patterns are established
2. When your territories are fragmented and need consolidation
3. When facing multiple opponents and needing to efficiently allocate resources
4. When planning multi-turn strategies

## Combining with Other Strategies

Reinforcement optimization works well with:

1. **Territory connections** - Directly influences reinforcement calculation
2. **Border security** - Helps determine where reinforcements are most needed
3. **Choke point control** - Identifies critical territories for reinforcement
4. **Player ranking** - Adjusts reinforcement priorities based on threat assessment
