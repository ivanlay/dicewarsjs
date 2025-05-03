/**
 * Example AI that demonstrates basic game mechanics
 * This AI implements a simple strategy:
 * 1. Finds all valid attacks where the attacker has more dice than the defender
 * 2. Randomly selects one of these valid attacks
 * 3. Continues until no valid attacks remain
 * 
 * This implementation is written for clarity and educational purposes,
 * showing the basic structure needed for any Dice Wars AI.
 */
export function ai_example(game) {
    const current_player = game.get_pn();  // Get the index of the current player
    
    /**
     * Create a list of valid moves (attacker/defender pairs)
     * Each move must meet these criteria:
     * - Attacking territory must be owned by current player
     * - Attacking territory must have more than 1 die
     * - Defending territory must be adjacent
     * - Attacker must have more dice than defender
     */
    const list_moves = new Array(game.AREA_MAX * game.AREA_MAX);
    let number_of_moves = 0;

    // Iterate through all territories to find potential attackers
    for (let i = 1; i < game.AREA_MAX; i++) {
        const attacking_area = game.adat[i];

        if (attacking_area.size == 0) continue;  // Skip empty territories
        if (attacking_area.arm != current_player) continue;  // Skip enemy territories
        if (attacking_area.dice <= 1) continue;  // Skip territories with 1 or fewer dice

        // For each potential attacker, look for valid targets
        for (let j = 1; j < game.AREA_MAX; j++) {
            const defending_area = game.adat[j];

            if (defending_area.size == 0) continue;  // Skip empty territories
            if (defending_area.arm == current_player) continue;  // Skip own territories
            if (attacking_area.join[j] == 0) continue;  // Skip non-adjacent territories

            // Skip if defender has equal or more dice (considered a bad move)
            if (defending_area.dice >= game.adat[i].dice) continue;

            // Add valid move to the list
            list_moves[number_of_moves] = {
                "attacker": i,  // Index of the attacking territory
                "defender": j   // Index of the defending territory
            };
            number_of_moves++;
        }
    }

    // End turn if no valid moves found
    if (number_of_moves == 0) return 0;

    // Randomly select a move from the valid options
    const n = Math.floor(Math.random() * number_of_moves);
    const move = list_moves[n];

    // Set the selected move in the game state
    game.area_from = move["attacker"];  // Set attacking territory
    game.area_to = move["defender"];  // Set defending territory
    
    // Note: This function will be called repeatedly until it returns 0
    // Returning nothing here allows the attack to proceed
}