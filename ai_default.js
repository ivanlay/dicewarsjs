/**
 * Default AI strategy from gamedesign.jp
 * This AI uses a simple but effective approach:
 * 1. Counts territories and dice for each player
 * 2. Ranks players by dice count
 * 3. Identifies dominant players
 * 4. Makes random attacks from valid options
 */
function ai_default(game){
    var i,j;
    
    // Initialize area and dice counts for all players
    for( i=0; i<8; i++ ){
        game.player[i].area_c = 0;
        game.player[i].dice_c = 0;
    }

    // Count total dice and territories for each player
    var sum = 0;
    for( i=1; i<game.AREA_MAX; i++ ){
        if( game.adat[i].size == 0 ) continue;
        var arm = game.adat[i].arm;
        game.player[arm].area_c++;
        game.player[arm].dice_c += game.adat[i].dice;
        sum += game.adat[i].dice;
    }

    /**
     * Calculate dice ranking for each player (0 = highest rank)
     * Uses bubble sort to rank players by total dice count
     */
    for( i=0; i<8; i++ ) game.player[i].dice_jun = i;
    for( i=0; i<8-1; i++ ){
        for( j=i+1; j<8; j++ ){
            if( game.player[i].dice_c < game.player[j].dice_c ){
                var tmp = game.player[i].dice_jun;
                game.player[i].dice_jun = game.player[j].dice_jun;
                game.player[j].dice_jun = tmp;
            }
        }
    }

    /**
     * Identify if there's a dominant player
     * A player is considered dominant if they have more than 40% of total dice
     */
    var top = -1;
    for( i=0; i<8; i++ ){
        if( game.player[i].dice_c > sum*2/5 ) top = i;
    }

    /**
     * Create lists of possible attack sources and destinations
     * The AI will randomly choose from valid attacks that meet these criteria:
     * - Attacker has more dice than defender
     * - If dice counts are equal:
     *   - 90% chance to attack if either player is top ranked
     *   - 90% chance to attack in any case
     * - If there's a dominant player, only consider attacks involving them
     */
    var list_from = new Array(game.AREA_MAX*game.AREA_MAX);
    var list_to = new Array(game.AREA_MAX*game.AREA_MAX);
    var lc = 0;
    var pn = game.jun[game.ban];  // Get current player number

    // Build list of valid attacks
    for( i=1; i<game.AREA_MAX; i++ ){
        if( game.adat[i].size == 0 ) continue;  // Skip empty territories
        if( game.adat[i].arm != pn ) continue;  // Skip enemy territories
        if( game.adat[i].dice <= 1 ) continue;  // Skip territories with 1 or fewer dice

        for( j=1; j<game.AREA_MAX; j++ ){
            if( game.adat[j].size == 0 ) continue;  // Skip empty territories
            if( game.adat[j].arm == pn ) continue;  // Skip own territories
            if( game.adat[i].join[j]==0 ) continue;  // Skip non-adjacent territories

            // If there's a dominant player, only consider attacks involving them
            if( top>=0 ){
                if( game.adat[i].arm!=top && game.adat[j].arm!=top ) continue;
            }

            // Skip if defender has more dice
            if( game.adat[j].dice > game.adat[i].dice ) continue;

            // Handle equal dice situations
            if( game.adat[j].dice == game.adat[i].dice ){
                var en = game.adat[j].arm;
                var f=0;
                if( game.player[pn].dice_jun == 0 ) f=1;  // Attack if we're top ranked
                if( game.player[en].dice_jun == 0 ) f=1;  // Attack if opponent is top ranked
                if( Math.random()*10>1 ) f=1;  // 90% chance to attack in equal dice situations
                if( f==0 ) continue;
            }

            // Add valid attack to list
            list_from[lc] = i;
            list_to[lc] = j;
            lc++;
        }
    }

    // End turn if no valid attacks found
    if( lc == 0 ) return 0;

    // Choose a random valid attack from the list
    var n = Math.floor(Math.random()*lc);
    game.area_from = list_from[n];
    game.area_to = list_to[n];
}
