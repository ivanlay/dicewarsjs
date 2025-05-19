/**
 * Defensive AI strategy that focuses on safe attacks and territory protection
 * This AI analyzes the board state to find attacks that won't leave territories vulnerable
 */
export const ai_defensive = game => {
  /**
   * Analyzes a territory to gather information about its neighbors
   * @param {number} area_id - The territory to analyze
   * @returns {Object} Information about the territory's neighbors
   */
  const analyzeTerritory = area_id => {
    // Initialize neighbor data with default values
    const neighborData = {
      friendly_neighbors: 0,
      unfriendly_neighbors: 0,
      highest_friendly_neighbor_dice: 0,
      highest_unfriendly_neighbor_dice: 0,
      second_highest_unfriendly_neighbor_dice: 0,
      num_neighbors: 0,
    };

    // Get the current area's data
    const currentArea = game.adat[area_id];

    // Create array of adjacent territories
    const adjacentTerritories = [...Array(game.AREA_MAX).keys()].filter(
      i => i !== area_id && currentArea.join[i]
    );

    // Process each adjacent territory
    adjacentTerritories.forEach(i => {
      const { arm: owner, dice: num_dice } = game.adat[i];
      const isFriendly = currentArea.arm === owner;

      if (isFriendly) {
        // Update friendly neighbor data
        neighborData.friendly_neighbors += 1;
        neighborData.highest_friendly_neighbor_dice = Math.max(
          neighborData.highest_friendly_neighbor_dice,
          num_dice
        );
      } else {
        // Update unfriendly neighbor data
        neighborData.unfriendly_neighbors += 1;

        // Update highest and second highest dice counts
        if (neighborData.highest_unfriendly_neighbor_dice < num_dice) {
          neighborData.second_highest_unfriendly_neighbor_dice =
            neighborData.highest_unfriendly_neighbor_dice;
          neighborData.highest_unfriendly_neighbor_dice = num_dice;
        } else if (neighborData.second_highest_unfriendly_neighbor_dice < num_dice) {
          neighborData.second_highest_unfriendly_neighbor_dice = num_dice;
        }
      }
    });

    // Calculate total neighbors
    neighborData.num_neighbors =
      neighborData.friendly_neighbors + neighborData.unfriendly_neighbors;

    return neighborData;
  };

  // Pre-compute neighbor information for all territories to avoid redundant calculations
  const area_info = [...Array(game.AREA_MAX).keys()].map(analyzeTerritory);

  const pn = game.get_pn(); // Get current player number
  const { player, adat } = game; // Destructure game properties

  // Initialize attack choice
  let bestAttack = { from: -1, to: -1 };

  /**
   * Checks if an attack is valid based on defensive strategy
   * @param {number} defender - The territory being attacked
   * @param {number} attacker - The territory launching the attack
   * @returns {boolean} Whether the attack is valid
   */
  const isValidAttack = (defender, attacker) => {
    const defenderArea = adat[defender];
    const attackerArea = adat[attacker];

    // Basic validity checks
    if (defenderArea.arm === pn) return false; // Skip own territories
    if (attackerArea.arm !== pn) return false; // Skip enemy territories
    if (!defenderArea.join[attacker]) return false; // Skip non-adjacent territories

    // Skip if attacker doesn't have advantage (unless at max dice)
    if (defenderArea.dice >= attackerArea.dice && attackerArea.dice !== 8) return false;

    // Skip if winning would leave territory vulnerable to counter-attack
    if (area_info[defender].highest_friendly_neighbor_dice > attackerArea.dice) return false;

    // Skip if we have a large territory to protect and no reinforcements
    if (
      player[pn].area_tc > 4 &&
      area_info[attacker].second_highest_unfriendly_neighbor_dice > 2 &&
      player[pn].stock === 0
    )
      return false;

    return true;
  };

  /**
   * Compares two valid attacks and determines which is better
   * @param {Object} attack1 - First attack {from, to}
   * @param {Object} attack2 - Second attack {from, to}
   * @returns {Object} The better attack
   */
  const getBetterAttack = (attack1, attack2) => {
    // If first attack is not set, use the second
    if (attack1.from === -1) return attack2;

    const fromTerritory1 = attack1.from;
    const fromTerritory2 = attack2.from;

    // Prioritize attacks from territories with only one enemy neighbor
    if (area_info[fromTerritory1].unfriendly_neighbors === 1) {
      if (area_info[fromTerritory2].unfriendly_neighbors === 1) {
        // If both have one enemy neighbor, prefer larger dice count
        if (adat[fromTerritory2].dice < adat[fromTerritory1].dice) {
          return attack1;
        } else if (adat[fromTerritory2].dice === adat[fromTerritory1].dice) {
          // If equal dice, prefer less connected territory
          if (area_info[fromTerritory2].num_neighbors < area_info[fromTerritory1].num_neighbors) {
            return attack1;
          }
        }
      } else {
        return attack1; // Keep the territory with one enemy neighbor
      }
    }

    return attack2; // Default to new attack
  };

  // Find all valid attacks
  const findBestAttack = () => {
    for (let defender = 0; defender < game.AREA_MAX; defender++) {
      for (let attacker = 0; attacker < game.AREA_MAX; attacker++) {
        // Check if this is a valid attack
        if (isValidAttack(defender, attacker)) {
          // Compare with previous best attack
          const newAttack = { from: attacker, to: defender };
          bestAttack = getBetterAttack(bestAttack, newAttack);
        }
      }
    }
  };

  // Execute main attack selection logic
  findBestAttack();

  // Set game state with best attack or end turn
  if (bestAttack.from !== -1) {
    game.area_from = bestAttack.from;
    game.area_to = bestAttack.to;
  } else {
    return 0; // End turn if no valid attack found
  }
};
