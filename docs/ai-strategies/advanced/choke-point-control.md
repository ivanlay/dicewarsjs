# Choke Point Control Strategy

The choke point control strategy focuses on identifying and controlling territories that serve as strategic bottlenecks or access points to larger regions.

## Core Concept

Choke points are territories that:
1. Connect larger regions of the map
2. Limit access to your territories
3. Control access to opponent territories
4. Create natural defensive positions

Controlling these strategic territories can give you a significant advantage by limiting opponent movement and protecting your territory with fewer resources.

## Identifying Choke Points

Choke points typically have these characteristics:

1. **Connectivity pattern** - Often have fewer connections than surrounding territories
2. **Positional importance** - Bridge between regions or provide access to otherwise isolated areas
3. **Strategic value** - Control over these territories impacts a disproportionately large area

```javascript
function identifyChokePoints(game) {
    const chokePoints = [];
    const connectivity = [];
    
    // Calculate average connectivity for all territories
    let totalConnections = 0;
    let countedTerritories = 0;
    
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size == 0) continue;
        
        let connections = 0;
        for (let j = 1; j < game.AREA_MAX; j++) {
            if (game.adat[j].size == 0) continue;
            if (game.adat[i].join[j]) connections++;
        }
        
        connectivity[i] = connections;
        totalConnections += connections;
        countedTerritories++;
    }
    
    const averageConnectivity = totalConnections / countedTerritories;
    
    // Find territories with below-average connectivity that connect different regions
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size == 0) continue;
        
        // Below average connectivity is the first indicator
        if (connectivity[i] <= averageConnectivity) {
            // Check if removing this territory would disconnect the map
            const isChokePoint = wouldDisconnectMap(game, i);
            
            if (isChokePoint) {
                chokePoints.push({
                    territory: i,
                    connectivity: connectivity[i],
                    owner: game.adat[i].arm,
                    dice: game.adat[i].dice
                });
            }
        }
    }
    
    return chokePoints;
}

function wouldDisconnectMap(game, territory) {
    // Save the original owner
    const originalOwner = game.adat[territory].arm;
    
    // Temporarily give this territory to a non-existent player
    game.adat[territory].arm = -999;
    
    // Check connectivity for all players
    for (let player = 0; player < 8; player++) {
        // Skip non-active players
        if (game.player[player].area_c === 0) continue;
        
        // Calculate original connected territory size
        game.set_area_tc(player);
        const originalSize = game.player[player].area_tc;
        
        // If player has territories, check if they'd be disconnected
        if (originalSize > 0) {
            // If some territories would be disconnected, this is a choke point
            if (wouldDisconnectPlayerTerritories(game, player)) {
                // Restore original owner
                game.adat[territory].arm = originalOwner;
                return true;
            }
        }
    }
    
    // Restore original owner
    game.adat[territory].arm = originalOwner;
    return false;
}

function wouldDisconnectPlayerTerritories(game, player) {
    // Get all territories for this player
    const territories = [];
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size == 0) continue;
        if (game.adat[i].arm == player) {
            territories.push(i);
        }
    }
    
    if (territories.length <= 1) return false;
    
    // Check if all territories are connected using BFS
    const visited = new Set();
    const queue = [territories[0]];
    visited.add(territories[0]);
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        // Check all adjacent territories
        for (let i = 1; i < game.AREA_MAX; i++) {
            if (game.adat[i].size == 0) continue;
            if (game.adat[i].arm != player) continue;
            if (!game.adat[current].join[i]) continue;
            
            if (!visited.has(i)) {
                visited.add(i);
                queue.push(i);
            }
        }
    }
    
    // If we couldn't visit all territories, they're disconnected
    return visited.size !== territories.length;
}
```

## Strategic Applications

### 1. Defensive Choke Point Control

```javascript
function defendChokePoints(game, chokePoints) {
    const player = game.get_pn();
    const defensePriorities = [];
    
    // Evaluate owned choke points for defensive reinforcement
    for (const cp of chokePoints) {
        if (cp.owner !== player) continue;
        
        // Calculate threat level
        let threat = 0;
        let enemyNeighbors = 0;
        
        for (let i = 1; i < game.AREA_MAX; i++) {
            if (game.adat[i].size == 0) continue;
            if (!game.adat[cp.territory].join[i]) continue;
            
            if (game.adat[i].arm !== player) {
                threat += game.adat[i].dice;
                enemyNeighbors++;
            }
        }
        
        // Higher priority for territories with more enemy neighbors and higher threat
        const priority = (threat * 2) + (enemyNeighbors * 5);
        
        defensePriorities.push({
            territory: cp.territory,
            priority: priority,
            currentDice: cp.dice,
            maxReinforcement: 8 - cp.dice
        });
    }
    
    // Sort by priority (highest first)
    defensePriorities.sort((a, b) => b.priority - a.priority);
    
    return defensePriorities;
}
```

### 2. Offensive Choke Point Targeting

```javascript
function targetEnemyChokePoints(game, chokePoints) {
    const player = game.get_pn();
    const attackTargets = [];
    
    // Evaluate enemy choke points for attack
    for (const cp of chokePoints) {
        if (cp.owner === player) continue;
        
        // Find our territories that can attack this choke point
        for (let i = 1; i < game.AREA_MAX; i++) {
            if (game.adat[i].size == 0) continue;
            if (game.adat[i].arm !== player) continue;
            if (game.adat[i].dice <= 1) continue; // Need at least 2 dice to attack
            if (!game.adat[i].join[cp.territory]) continue;
            
            // Calculate attack value
            const diceAdvantage = game.adat[i].dice - cp.dice;
            
            // Only consider attacks with a dice advantage
            if (diceAdvantage > 0) {
                attackTargets.push({
                    from: i,
                    to: cp.territory,
                    diceAdvantage: diceAdvantage,
                    // Higher strategic value for choke points with lower connectivity
                    strategicValue: (10 - cp.connectivity) * 3,
                    priority: diceAdvantage + ((10 - cp.connectivity) * 3)
                });
            }
        }
    }
    
    // Sort by priority (highest first)
    attackTargets.sort((a, b) => b.priority - a.priority);
    
    return attackTargets;
}
```

### 3. Territory Cutting

A specialized variant of choke point control is "territory cutting" - identifying and capturing territories that would split an opponent's connected territory group:

```javascript
function findTerritoryCuts(game) {
    const player = game.get_pn();
    const cutTargets = [];
    
    // Check all enemy territories
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size == 0) continue;
        if (game.adat[i].arm === player) continue;
        
        const enemyPlayer = game.adat[i].arm;
        
        // Save original connected territory size for this enemy
        const originalSize = game.player[enemyPlayer].area_tc;
        
        // Simulate capturing this territory
        const originalOwner = game.adat[i].arm;
        game.adat[i].arm = player;
        
        // Recalculate enemy's connected territory size
        game.set_area_tc(enemyPlayer);
        const newSize = game.player[enemyPlayer].area_tc;
        
        // If this would significantly reduce their connected territory
        if (newSize < originalSize - 1) {
            // Check if we can attack this territory
            let canAttack = false;
            let bestAttacker = -1;
            let bestDiceAdvantage = -1;
            
            for (let j = 1; j < game.AREA_MAX; j++) {
                if (game.adat[j].size == 0) continue;
                if (game.adat[j].arm !== player) continue;
                if (game.adat[j].dice <= 1) continue;
                if (!game.adat[j].join[i]) continue;
                
                const diceAdvantage = game.adat[j].dice - game.adat[i].dice;
                if (diceAdvantage > 0 && diceAdvantage > bestDiceAdvantage) {
                    canAttack = true;
                    bestAttacker = j;
                    bestDiceAdvantage = diceAdvantage;
                }
            }
            
            if (canAttack) {
                cutTargets.push({
                    from: bestAttacker,
                    to: i,
                    diceAdvantage: bestDiceAdvantage,
                    connectivityImpact: originalSize - newSize,
                    priority: bestDiceAdvantage + ((originalSize - newSize) * 2)
                });
            }
        }
        
        // Restore original owner
        game.adat[i].arm = originalOwner;
        
        // Restore original connected territory calculation
        game.set_area_tc(enemyPlayer);
    }
    
    // Sort by priority (highest first)
    cutTargets.sort((a, b) => b.priority - a.priority);
    
    return cutTargets;
}
```

## When to Use

Choke point control is most effective:

1. On maps with natural bottlenecks
2. In the mid-game when territory control is being established
3. When playing defensively with limited resources
4. When trying to split opponent territories to reduce their reinforcements

## Combining with Other Strategies

Choke point control works well with:

1. **Territory connections** - Choke points often control territory connectivity
2. **Border security** - Choke points are often critical border territories
3. **Neighbor analysis** - Helps identify the strategic value of territories
4. **Reinforcement optimization** - Prioritizes reinforcing strategically valuable choke points