/**
 * Game Utilities Module
 * 
 * Provides helper functions for game logic:
 * - Attack calculations
 * - Territory analysis
 * - Player statistics
 */

/**
 * Calculate attack success probability
 * @param {number} attackerDice - Number of attacker dice
 * @param {number} defenderDice - Number of defender dice
 * @returns {number} Probability of success (0-1)
 */
export function calculateAttackProbability(attackerDice, defenderDice) {
  // Using a simplified formula based on dice counts
  // For exact calculation, you'd need to consider all possible dice combinations
  
  if (attackerDice <= 1 || defenderDice <= 0) return 0;
  
  if (attackerDice > defenderDice) {
    return Math.min(0.95, (attackerDice / defenderDice) * 0.65);
  } else if (attackerDice === defenderDice) {
    return 0.45;
  } else {
    return Math.max(0.05, (attackerDice / defenderDice) * 0.45);
  }
}

/**
 * Simulate attack result
 * @param {number} attackerDice - Number of attacker dice
 * @param {number} defenderDice - Number of defender dice
 * @returns {Object} Result object with dice rolls and outcome
 */
export function simulateAttack(attackerDice, defenderDice) {
  // Generate random rolls for attacker and defender
  const attackerRolls = rollDice(attackerDice);
  const defenderRolls = rollDice(defenderDice);
  
  const attackerSum = attackerRolls.reduce((a, b) => a + b, 0);
  const defenderSum = defenderRolls.reduce((a, b) => a + b, 0);
  
  const success = attackerSum > defenderSum;
  
  return {
    attackerRolls,
    defenderRolls,
    attackerSum,
    defenderSum,
    success
  };
}

/**
 * Roll dice and return an array of values
 * @param {number} count - Number of dice to roll
 * @returns {Array<number>} Array of dice values (1-6)
 */
export function rollDice(count) {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * 6) + 1);
  }
  return rolls;
}

/**
 * Analyze a territory to gather information about its neighbors
 * @param {Game} game - Game instance
 * @param {number} areaId - ID of the territory to analyze
 * @returns {Object} Territory analysis data
 */
export function analyzeTerritory(game, areaId) {
  const territory = game.adat[areaId];
  if (territory.size === 0) return null;
  
  const owner = territory.arm;
  const diceCount = territory.dice;
  
  let friendlyNeighbors = 0;
  let enemyNeighbors = 0;
  let strongestFriendlyNeighbor = 0;
  let strongestEnemyNeighbor = 0;
  let weakestEnemyNeighbor = Infinity;
  let weakestEnemyWithFewerDice = Infinity;
  let weakestEnemyNeighborId = -1;
  
  // Analyze neighbors
  for (let i = 1; i < game.AREA_MAX; i++) {
    if (i === areaId || game.adat[i].size === 0) continue;
    if (territory.join[i] === 0) continue; // Not adjacent
    
    const neighborDice = game.adat[i].dice;
    
    if (game.adat[i].arm === owner) {
      // Friendly neighbor
      friendlyNeighbors++;
      if (neighborDice > strongestFriendlyNeighbor) {
        strongestFriendlyNeighbor = neighborDice;
      }
    } else {
      // Enemy neighbor
      enemyNeighbors++;
      if (neighborDice > strongestEnemyNeighbor) {
        strongestEnemyNeighbor = neighborDice;
      }
      
      if (neighborDice < weakestEnemyNeighbor) {
        weakestEnemyNeighbor = neighborDice;
        weakestEnemyNeighborId = i;
      }
      
      if (neighborDice < diceCount && neighborDice < weakestEnemyWithFewerDice) {
        weakestEnemyWithFewerDice = neighborDice;
      }
    }
  }
  
  // Calculate vulnerability rating (0-100, higher = more vulnerable)
  let vulnerabilityRating = 0;
  
  if (diceCount === 1) {
    vulnerabilityRating = 100; // One die is always vulnerable
  } else if (enemyNeighbors > 0) {
    // Base vulnerability on ratio of territory dice to strongest enemy
    vulnerabilityRating = Math.min(100, 
      Math.floor((strongestEnemyNeighbor / diceCount) * 70) + 
      Math.min(30, enemyNeighbors * 10)
    );
  }
  
  // Calculate attack opportunity rating (0-100, higher = better attack)
  let attackOpportunityRating = 0;
  let bestTargetId = -1;
  
  if (diceCount > 1 && weakestEnemyWithFewerDice < Infinity) {
    // Base opportunity on dice advantage
    attackOpportunityRating = Math.min(100, 
      Math.floor((diceCount / Math.max(1, weakestEnemyWithFewerDice)) * 80)
    );
    bestTargetId = weakestEnemyNeighborId;
  }
  
  return {
    id: areaId,
    owner,
    diceCount,
    friendlyNeighbors,
    enemyNeighbors,
    strongestFriendlyNeighbor,
    strongestEnemyNeighbor,
    weakestEnemyNeighbor,
    weakestEnemyNeighborId,
    vulnerabilityRating,
    attackOpportunityRating,
    bestTargetId
  };
}

/**
 * Find best attack for a player
 * @param {Game} game - Game instance
 * @param {number} playerId - Player ID
 * @returns {Object|null} Best attack or null if no valid attacks
 */
export function findBestAttack(game, playerId) {
  let bestAttack = null;
  let bestRating = -1;
  
  // Check all territories owned by player
  for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size === 0 || game.adat[i].arm !== playerId || game.adat[i].dice <= 1) {
      continue;
    }
    
    const analysis = analyzeTerritory(game, i);
    
    if (analysis.attackOpportunityRating > 0 && analysis.bestTargetId !== -1) {
      const targetAnalysis = analyzeTerritory(game, analysis.bestTargetId);
      
      // Calculate combined rating based on attack opportunity and target value
      const combinedRating = analysis.attackOpportunityRating +
        (targetAnalysis ? targetAnalysis.enemyNeighbors * 5 : 0);
      
      if (combinedRating > bestRating) {
        bestRating = combinedRating;
        bestAttack = {
          from: i,
          to: analysis.bestTargetId,
          fromDice: analysis.diceCount,
          toDice: game.adat[analysis.bestTargetId].dice,
          probability: calculateAttackProbability(
            analysis.diceCount, 
            game.adat[analysis.bestTargetId].dice
          ),
          rating: combinedRating
        };
      }
    }
  }
  
  return bestAttack;
}

/**
 * Calculate optimal reinforcement distribution
 * @param {Game} game - Game instance
 * @param {number} playerId - Player ID
 * @returns {Array<number>} Array of area IDs to reinforce, sorted by priority
 */
export function calculateReinforcements(game, playerId) {
  const candidates = [];
  
  // Analyze all territories owned by player
  for (let i = 1; i < game.AREA_MAX; i++) {
    if (game.adat[i].size === 0 || game.adat[i].arm !== playerId) {
      continue;
    }
    
    const analysis = analyzeTerritory(game, i);
    
    if (analysis) {
      // Calculate reinforcement priority based on:
      // 1. Vulnerability (higher = more urgent)
      // 2. Strategic value (border territories with many enemy neighbors)
      // 3. Attack potential (territories that could attack with more dice)
      
      let priority = 0;
      
      // Vulnerability factor
      priority += analysis.vulnerabilityRating * 0.5;
      
      // Strategic position factor
      priority += analysis.enemyNeighbors * 10;
      
      // Attack potential factor
      if (analysis.diceCount > 1 && analysis.weakestEnemyNeighbor < Infinity) {
        // Prioritize territories that are close to having attack advantage
        const diceNeeded = Math.max(0, 
          analysis.weakestEnemyNeighbor - analysis.diceCount + 1
        );
        
        if (diceNeeded <= 2) {
          priority += (3 - diceNeeded) * 20;
        }
      }
      
      // Deprioritize territories that already have many dice
      if (analysis.diceCount >= 6) {
        priority -= (analysis.diceCount - 5) * 15;
      }
      
      candidates.push({
        id: i,
        priority
      });
    }
  }
  
  // Sort candidates by priority (highest first)
  candidates.sort((a, b) => b.priority - a.priority);
  
  return candidates.map(c => c.id);
}