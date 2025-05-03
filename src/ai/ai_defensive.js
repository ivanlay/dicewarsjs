/**
 * Defensive AI strategy that focuses on safe attacks and territory protection
 * This AI analyzes the board state to find attacks that won't leave territories vulnerable
 */
export function ai_defensive(game) {
    /**
     * Analyzes a territory to gather information about its neighbors
     * @param {number} area_id - The territory to analyze
     * @returns {Object} Information about the territory's neighbors including:
     *   - Number of friendly and enemy neighbors
     *   - Highest dice counts among friendly and enemy neighbors
     *   - Second highest dice count among enemy neighbors
     *   - Total number of neighbors
     */
    function area_get_info(area_id) {
        let friendly_neighbors = 0;
        let unfriendly_neighbors = 0;
        let highest_friendly_neighbor_dice = 0;
        let highest_unfriendly_neighbor_dice = 0;
        let second_highest_unfriendly_neighbor_dice = 0;
        let num_neighbors = 0;

        for (let i = 0; i < game.AREA_MAX; i++) {
            if (i == area_id) continue;

            // Skip non-adjacent territories
            if (!game.adat[area_id].join[i])
                continue;

            const num_dice = game.adat[i].dice;

            if (game.adat[area_id].arm == game.adat[i].arm) {
                friendly_neighbors += 1;
                // Track highest dice count among friendly neighbors
                if (highest_friendly_neighbor_dice < num_dice)
                    highest_friendly_neighbor_dice = num_dice;
            }
            else {
                unfriendly_neighbors += 1;
                // Track highest and second highest dice counts among enemy neighbors
                if (highest_unfriendly_neighbor_dice < num_dice) {
                    second_highest_unfriendly_neighbor_dice = highest_unfriendly_neighbor_dice;
                    highest_unfriendly_neighbor_dice = num_dice;
                }
                else if (second_highest_unfriendly_neighbor_dice < num_dice)
                    second_highest_unfriendly_neighbor_dice = num_dice;
            }
        }

        num_neighbors = friendly_neighbors + unfriendly_neighbors;

        return {
            friendly_neighbors,
            unfriendly_neighbors,
            highest_friendly_neighbor_dice,
            highest_unfriendly_neighbor_dice,
            second_highest_unfriendly_neighbor_dice,
            num_neighbors
        };
    }

    // Pre-compute neighbor information for all territories to avoid redundant calculations
    const area_info = [...Array(game.AREA_MAX).keys()].map(area_get_info);

    const pn = game.get_pn();  // Get current player number

    game.area_from = -1;
    game.area_to = -1;

    // Evaluate all potential attacks
    for (let i = 0; i < game.AREA_MAX; i++) {
        if (game.adat[i].arm == pn) continue;  // Skip own territories

        // Check all potential attacking territories
        for (let j = 0; j < game.AREA_MAX; j++) {
            if (game.adat[j].arm != pn) continue;  // Skip enemy territories
            if (!game.adat[i].join[j]) continue;  // Skip non-adjacent territories

            // Skip if attacker doesn't have advantage (unless at max dice)
            if (game.adat[i].dice >= game.adat[j].dice && game.adat[j].dice != 8) continue;

            // Skip if winning would leave territory vulnerable to counter-attack
            if (area_info[i].highest_friendly_neighbor_dice > game.adat[j].dice) continue;

            // Skip if we have a large territory to protect and no reinforcements
            if (game.player[pn].area_tc > 4
                && area_info[j].second_highest_unfriendly_neighbor_dice > 2
                && game.player[pn].stock == 0) continue;

            // Compare with previous best attack
            if (game.area_from == -1) {
                // First valid attack found
                game.area_from = j;
                game.area_to = i;
            } else {
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
                game.area_from = j;
                game.area_to = i;
            }
        }
    }

    // Return 0 to end turn if no valid attack found
    if (game.area_from == -1)
        return 0;
}