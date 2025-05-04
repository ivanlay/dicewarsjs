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
export const calculateAttackProbability = (attackerDice, defenderDice) => {
  /*
   * Using a simplified formula based on dice counts
   * For exact calculation, you'd need to consider all possible dice combinations
   */

  if (attackerDice <= 1 || defenderDice <= 0) return 0;

  if (attackerDice > defenderDice) {
    return Math.min(0.95, (attackerDice / defenderDice) * 0.65);
  }
  if (attackerDice === defenderDice) {
    return 0.45;
  }
  return Math.max(0.05, (attackerDice / defenderDice) * 0.45);
};

/**
 * Simulate attack result
 * @param {number} attackerDice - Number of attacker dice
 * @param {number} defenderDice - Number of defender dice
 * @returns {Object} Result object with dice rolls and outcome
 */
export const simulateAttack = (attackerDice, defenderDice) => {
  // Generate random rolls for attacker and defender
  const attackerRolls = rollDice(attackerDice);
  const defenderRolls = rollDice(defenderDice);

  const attackerSum = attackerRolls.reduce((a, b) => a + b, 0);
  const defenderSum = defenderRolls.reduce((a, b) => a + b, 0);

  // Use object shorthand properties for cleaner object creation
  return {
    attackerRolls,
    defenderRolls,
    attackerSum,
    defenderSum,
    success: attackerSum > defenderSum,
  };
};

/**
 * Roll dice and return an array of values
 * @param {number} count - Number of dice to roll
 * @returns {Array<number>} Array of dice values (1-6)
 */
export const rollDice = count =>
  // Use Array.from to create and fill the array in one step
  Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);

/**
 * Analyze a territory to gather information about its neighbors
 * @param {Game} game - Game instance
 * @param {number} areaId - ID of the territory to analyze
 * @returns {Object} Territory analysis data
 */
export const analyzeTerritory = (game, areaId) => {
  const territory = game.adat[areaId];
  if (territory.size === 0) return null;

  // Use destructuring to get properties from territory
  const { arm: owner, dice: diceCount } = territory;

  // Initialize neighbor analysis data
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

    // Use destructuring to get properties from neighbor
    const { arm: neighborOwner, dice: neighborDice } = game.adat[i];

    if (neighborOwner === owner) {
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
    vulnerabilityRating = Math.min(
      100,
      Math.floor((strongestEnemyNeighbor / diceCount) * 70) + Math.min(30, enemyNeighbors * 10)
    );
  }

  // Calculate attack opportunity rating (0-100, higher = better attack)
  let attackOpportunityRating = 0;
  let bestTargetId = -1;

  if (diceCount > 1 && weakestEnemyWithFewerDice < Infinity) {
    // Base opportunity on dice advantage
    attackOpportunityRating = Math.min(
      100,
      Math.floor((diceCount / Math.max(1, weakestEnemyWithFewerDice)) * 80)
    );
    bestTargetId = weakestEnemyNeighborId;
  }

  // Use object shorthand for cleaner return object
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
    bestTargetId,
  };
};

/**
 * Find best attack for a player
 * @param {Game} game - Game instance
 * @param {number} playerId - Player ID
 * @returns {Object|null} Best attack or null if no valid attacks
 */
export const findBestAttack = (game, playerId) => {
  let bestAttack = null;
  let bestRating = -1;

  // Check all territories owned by player
  for (let i = 1; i < game.AREA_MAX; i++) {
    // Use destructuring to access area properties
    const area = game.adat[i];
    const { size, arm, dice } = area;

    if (size === 0 || arm !== playerId || dice <= 1) {
      continue;
    }

    const analysis = analyzeTerritory(game, i);

    if (analysis.attackOpportunityRating > 0 && analysis.bestTargetId !== -1) {
      const targetAnalysis = analyzeTerritory(game, analysis.bestTargetId);

      // Calculate combined rating based on attack opportunity and target value
      const combinedRating =
        analysis.attackOpportunityRating + (targetAnalysis ? targetAnalysis.enemyNeighbors * 5 : 0);

      if (combinedRating > bestRating) {
        bestRating = combinedRating;

        // Destructure to get target dice
        const { dice: targetDice } = game.adat[analysis.bestTargetId];

        // Create attack object with shorthand properties
        bestAttack = {
          from: i,
          to: analysis.bestTargetId,
          fromDice: analysis.diceCount,
          toDice: targetDice,
          probability: calculateAttackProbability(analysis.diceCount, targetDice),
          rating: combinedRating,
        };
      }
    }
  }

  return bestAttack;
};

/**
 * Calculate optimal reinforcement distribution
 * @param {Game} game - Game instance
 * @param {number} playerId - Player ID
 * @returns {Array<number>} Array of area IDs to reinforce, sorted by priority
 */
export const calculateReinforcements = (game, playerId) => {
  const candidates = [];

  // Analyze all territories owned by player
  for (let i = 1; i < game.AREA_MAX; i++) {
    // Use destructuring for cleaner property access
    const { size, arm } = game.adat[i];

    if (size === 0 || arm !== playerId) {
      continue;
    }

    const analysis = analyzeTerritory(game, i);

    if (analysis) {
      // Destructure properties from analysis
      const { vulnerabilityRating, enemyNeighbors, diceCount, weakestEnemyNeighbor } = analysis;

      // Calculate reinforcement priority based on multiple factors
      let priority = 0;

      // Vulnerability factor
      priority += vulnerabilityRating * 0.5;

      // Strategic position factor
      priority += enemyNeighbors * 10;

      // Attack potential factor
      if (diceCount > 1 && weakestEnemyNeighbor < Infinity) {
        // Prioritize territories that are close to having attack advantage
        const diceNeeded = Math.max(0, weakestEnemyNeighbor - diceCount + 1);

        if (diceNeeded <= 2) {
          priority += (3 - diceNeeded) * 20;
        }
      }

      // Deprioritize territories that already have many dice
      if (diceCount >= 6) {
        priority -= (diceCount - 5) * 15;
      }

      // Add to candidates with object shorthand
      candidates.push({ id: i, priority });
    }
  }

  // Sort candidates by priority (highest first)
  candidates.sort((a, b) => b.priority - a.priority);

  // Extract just the IDs using destructuring in map function
  return candidates.map(({ id }) => id);
};
