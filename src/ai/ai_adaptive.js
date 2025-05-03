/**
 * Adaptive AI Strategy for Dice Wars
 * 
 * This AI dynamically adjusts its strategy based on game state analysis,
 * providing responsive decision-making that adapts to changing game conditions.
 * The AI considers:
 * - Game phase (early, mid, late)
 * - Player rankings and relative strength
 * - Territory connectivity and border security
 * - Choke points and strategic territory value
 * - Attack risk and potential rewards
 */
export function ai_adaptive(game) {
    // Get current player number
    const pn = game.get_pn();
    
    // Step 1: Analyze the game state
    const gameState = analyzeGameState(game);
    
    // Step 2: Determine appropriate strategy based on game state
    const strategy = determineStrategy(game, gameState, pn);
    
    // Step 3: Generate and evaluate possible moves
    const moves = generateMoves(game, strategy, pn);
    
    // Step 4: End turn if no valid moves available
    if (moves.length === 0) return 0;
    
    // Step 5: Select the best move based on the current strategy
    const bestMove = selectBestMove(moves, strategy);
    
    // Step 6: Execute the selected move
    game.area_from = bestMove.from;
    game.area_to = bestMove.to;
}

/**
 * Analyze the current game state to inform strategic decisions
 * Gathers comprehensive data about territories, players, and game progress
 * 
 * @param {Object} game - The game state object
 * @returns {Object} Analysis of the current game state
 */
function analyzeGameState(game) {
    const state = {
        playerStats: [],
        territories: {
            total: 0,
            byPlayer: new Array(8).fill(0)
        },
        dice: {
            total: 0,
            byPlayer: new Array(8).fill(0)
        },
        borderTerritories: new Array(8).fill(0),
        playerRankings: [],
        dominantPlayer: -1,
        averageDicePerTerritory: new Array(8).fill(0),
        gamePhase: 'early',
        remainingPlayers: 0,
        chokePoints: [],
        playerThreatLevel: new Array(8).fill(0)
    };
    
    // Calculate territory and dice statistics
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size === 0) continue;
        
        const player = game.adat[i].arm;
        const dice = game.adat[i].dice;
        
        // Count territories and dice by player
        state.territories.total++;
        state.territories.byPlayer[player]++;
        
        state.dice.total += dice;
        state.dice.byPlayer[player] += dice;
        
        // Check if this is a border territory
        let isBorder = false;
        for (let j = 1; j < game.AREA_MAX; j++) {
            if (game.adat[j].size === 0) continue;
            if (!game.adat[i].join[j]) continue;
            
            if (game.adat[j].arm !== player) {
                isBorder = true;
                break;
            }
        }
        
        if (isBorder) {
            state.borderTerritories[player]++;
        }
    }
    
    // Calculate average dice per territory and count active players
    for (let i = 0; i < 8; i++) {
        if (state.territories.byPlayer[i] > 0) {
            state.averageDicePerTerritory[i] = state.dice.byPlayer[i] / state.territories.byPlayer[i];
            state.remainingPlayers++;
            
            // Store player stats for easier access
            state.playerStats[i] = {
                territories: state.territories.byPlayer[i],
                dice: state.dice.byPlayer[i],
                borderTerritories: state.borderTerritories[i],
                averageDice: state.averageDicePerTerritory[i],
                connectedTerritories: game.player[i].area_tc
            };
        }
    }
    
    // Rank players by dice count (index 0 = highest ranking player)
    state.playerRankings = Array(8).fill().map((_, i) => i)
        .filter(i => state.territories.byPlayer[i] > 0) // Only include active players
        .sort((a, b) => state.dice.byPlayer[b] - state.dice.byPlayer[a]);
    
    // Identify dominant player (has >35% of total dice)
    for (let i = 0; i < 8; i++) {
        if (state.dice.byPlayer[i] > state.dice.total * 0.35) {
            state.dominantPlayer = i;
            break;
        }
    }
    
    // Calculate threat level each player poses to others
    for (let i = 0; i < 8; i++) {
        if (state.territories.byPlayer[i] === 0) continue;
        
        // Base threat on dice count and average dice
        state.playerThreatLevel[i] = state.dice.byPlayer[i] * 0.6 + 
                                    state.averageDicePerTerritory[i] * 10 + 
                                    (state.territories.byPlayer[i] / state.territories.total) * 50;
    }
    
    // Determine game phase based on territory occupation and player count
    if (state.territories.total > 0) {
        // Territory claim percentage - assumes about 30 territories total
        const territoriesClaimed = state.territories.total / 30;
        
        // Game phase depends on territory claim percentage and player count
        if (state.remainingPlayers > 5 || territoriesClaimed < 0.6) {
            state.gamePhase = 'early';
        } else if (state.remainingPlayers > 3 || territoriesClaimed < 0.9) {
            state.gamePhase = 'mid';
        } else {
            state.gamePhase = 'late';
        }
    }
    
    // Detect choke points (basic implementation)
    state.chokePoints = identifyChokePoints(game);
    
    return state;
}

/**
 * Identify territories that are strategic choke points
 * These are territories that connect different regions and control movement
 * 
 * @param {Object} game - The game state object
 * @returns {Array} List of choke point territories with their strategic value
 */
function identifyChokePoints(game) {
    const chokePoints = [];
    const areaConnectivity = [];
    
    // Calculate connectivity for all territories
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size === 0) continue;
        
        // Count how many other territories this one connects to
        let connections = 0;
        for (let j = 1; j < game.AREA_MAX; j++) {
            if (game.adat[j].size === 0) continue;
            if (game.adat[i].join[j]) connections++;
        }
        
        areaConnectivity[i] = connections;
    }
    
    // Identify potential choke points - simplistic approach
    // A more sophisticated implementation would check actual path disconnection
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size === 0) continue;
        
        // Count neighbors of each player
        const neighborsByPlayer = new Array(8).fill(0);
        
        for (let j = 1; j < game.AREA_MAX; j++) {
            if (game.adat[j].size === 0) continue;
            if (!game.adat[i].join[j]) continue;
            
            neighborsByPlayer[game.adat[j].arm]++;
        }
        
        // Count how many different players this territory connects
        let differentPlayers = 0;
        for (let p = 0; p < 8; p++) {
            if (neighborsByPlayer[p] > 0) differentPlayers++;
        }
        
        // If this territory connects multiple players' territories or has strategic value
        const strategicValue = differentPlayers * 3 + (areaConnectivity[i] > 3 ? 2 : 0);
        
        if (strategicValue >= 4) {
            chokePoints.push({
                territory: i,
                strategicValue: strategicValue,
                connectivity: areaConnectivity[i],
                owner: game.adat[i].arm,
                dice: game.adat[i].dice
            });
        }
    }
    
    // Sort by strategic value (highest first)
    chokePoints.sort((a, b) => b.strategicValue - a.strategicValue);
    
    return chokePoints;
}

/**
 * Determine the optimal strategy based on game state
 * Adjusts aggression, expansion focus, risk tolerance, and target selection
 * 
 * @param {Object} game - The game state object
 * @param {Object} gameState - The analyzed game state
 * @param {number} pn - Current player number
 * @returns {Object} Strategy parameters to guide decision making
 */
function determineStrategy(game, gameState, pn) {
    const strategy = {
        aggression: 0.5,     // 0 (defensive) to 1 (aggressive)
        expansion: 0.5,      // 0 (consolidate) to 1 (expand)
        riskTolerance: 0.5,  // 0 (risk-averse) to 1 (risk-seeking)
        targetSelection: {
            dominantPlayer: false,
            weakestPlayer: false,
            specificPlayer: -1
        },
        reinforcementFocus: 'balanced', // 'offensive', 'defensive', or 'balanced'
        prioritizeChokePoints: false
    };
    
    // Find our ranking among players
    const myRanking = gameState.playerRankings.indexOf(pn);
    const myRelativeStrength = myRanking / Math.max(1, gameState.remainingPlayers - 1);
    
    // Adjust based on game phase
    switch (gameState.gamePhase) {
        case 'early':
            // Early game: focus on expansion and territory acquisition
            strategy.aggression = 0.7;
            strategy.expansion = 0.8;
            strategy.riskTolerance = 0.6;
            
            // If we're significantly behind already, be more aggressive
            if (myRanking > 2 && gameState.remainingPlayers > 4) {
                strategy.aggression = 0.8;
                strategy.riskTolerance = 0.7;
            }
            break;
            
        case 'mid':
            // Mid game: balanced approach
            strategy.aggression = 0.5;
            strategy.expansion = 0.5;
            strategy.prioritizeChokePoints = true;
            
            // If we're leading, be more conservative to preserve advantage
            if (myRanking === 0) {
                strategy.aggression = 0.4;
                strategy.riskTolerance = 0.3;
                strategy.expansion = 0.4;
            }
            
            // If we're behind but not last, be more aggressive
            if (myRanking > 0 && myRanking < gameState.remainingPlayers - 1) {
                strategy.aggression = 0.7;
                strategy.riskTolerance = 0.6;
                
                // Target the player just ahead of us
                strategy.targetSelection.specificPlayer = gameState.playerRankings[myRanking - 1];
            }
            
            // If we're last, target the weakest player
            if (myRanking === gameState.remainingPlayers - 1) {
                strategy.aggression = 0.8;
                strategy.riskTolerance = 0.7;
                strategy.targetSelection.weakestPlayer = true;
            }
            break;
            
        case 'late':
            // Late game: focus on winning or survival
            
            // If we're leading, focus on eliminating the second-place player
            if (myRanking === 0) {
                strategy.aggression = 0.8;
                strategy.expansion = 0.6;
                strategy.targetSelection.specificPlayer = gameState.playerRankings[1];
            } 
            // If we're second, target the leader
            else if (myRanking === 1) {
                strategy.aggression = 0.7;
                strategy.riskTolerance = 0.6;
                strategy.targetSelection.specificPlayer = gameState.playerRankings[0];
            } 
            // If we're far behind, high risk/high reward strategy
            else {
                strategy.aggression = 0.9;
                strategy.riskTolerance = 0.8;
                strategy.targetSelection.weakestPlayer = true;
            }
            break;
    }
    
    // Adjust for dominant player presence
    if (gameState.dominantPlayer !== -1) {
        if (gameState.dominantPlayer === pn) {
            // We're dominant, play more defensively to maintain lead
            strategy.aggression = Math.max(0.3, strategy.aggression - 0.2);
            strategy.riskTolerance = Math.max(0.3, strategy.riskTolerance - 0.2);
        } else {
            // Someone else is dominant, focus on them if they're threatening us
            strategy.targetSelection.dominantPlayer = true;
            strategy.aggression = Math.min(0.8, strategy.aggression + 0.1);
        }
    }
    
    // Adjust for our territory connectivity
    const consolidationRatio = game.player[pn].area_tc / gameState.territories.byPlayer[pn];
    if (consolidationRatio < 0.7) {
        // Our territories are fragmented, focus on consolidation
        strategy.expansion = Math.max(0.2, strategy.expansion - 0.3);
    }
    
    // Adjust for border pressure
    const borderRatio = gameState.borderTerritories[pn] / gameState.territories.byPlayer[pn];
    if (borderRatio > 0.7) {
        // Many border territories, need defensive reinforcement
        strategy.reinforcementFocus = 'defensive';
        strategy.aggression = Math.max(0.3, strategy.aggression - 0.1);
    } else if (strategy.aggression > 0.7) {
        // Highly aggressive, reinforce for offense
        strategy.reinforcementFocus = 'offensive';
    }
    
    // Adjust for stock (available reinforcement dice)
    if (game.player[pn].stock > 4) {
        // We have reinforcements, can be more aggressive
        strategy.riskTolerance = Math.min(0.8, strategy.riskTolerance + 0.1);
    }
    
    return strategy;
}

/**
 * Generate and evaluate all possible moves based on the current strategy
 * 
 * @param {Object} game - The game state object
 * @param {Object} strategy - Strategic parameters
 * @param {number} pn - Current player number
 * @returns {Array} Sorted list of possible moves with their evaluated value
 */
function generateMoves(game, strategy, pn) {
    const moves = [];
    
    // Pre-calculate territory information to avoid redundant calculations
    const areaInfo = calculateAreaInfo(game);
    
    // Generate all possible attacking moves
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size === 0) continue;
        if (game.adat[i].arm !== pn) continue;
        if (game.adat[i].dice <= 1) continue;
        
        for (let j = 1; j < game.AREA_MAX; j++) {
            if (game.adat[j].size === 0) continue;
            if (game.adat[j].arm === pn) continue;
            if (!game.adat[i].join[j]) continue;
            
            // Calculate dice advantage
            const diceAdvantage = game.adat[i].dice - game.adat[j].dice;
            
            // Skip if we don't have an advantage, unless at max dice and aggressive
            if (diceAdvantage <= 0) {
                // Only consider equal dice attacks if we have max dice and high aggression
                if (!(game.adat[i].dice === 8 && strategy.aggression > 0.7)) {
                    continue;
                }
            }
            
            // Calculate attack risk
            const attackRisk = calculateAttackRisk(game, i, j, areaInfo);
            
            // Skip high-risk attacks if we're risk-averse
            if (attackRisk > 0.7 && strategy.riskTolerance < 0.4) continue;
            
            // Calculate strategic value of this attack
            const strategicValue = calculateStrategicValue(game, i, j, areaInfo, strategy);
            
            // Target selection adjustments
            let targetValue = 0;
            const defendingPlayer = game.adat[j].arm;
            
            // If we're targeting the dominant player and this is them
            if (strategy.targetSelection.dominantPlayer && defendingPlayer === game.dominantPlayer) {
                targetValue += 3;
            }
            
            // If we're targeting the weakest player
            if (strategy.targetSelection.weakestPlayer) {
                // Find the weakest active player
                const weakestPlayer = findWeakestPlayer(game);
                if (defendingPlayer === weakestPlayer) {
                    targetValue += 2;
                }
            }
            
            // If we're targeting a specific player
            if (strategy.targetSelection.specificPlayer !== -1 && 
                defendingPlayer === strategy.targetSelection.specificPlayer) {
                targetValue += 4;
            }
            
            // Check if this is a choke point (higher strategic value)
            let chokePointValue = 0;
            if (strategy.prioritizeChokePoints) {
                if (isChokePoint(game, j)) {
                    chokePointValue = 3;
                }
            }
            
            // Calculate total move value
            const moveValue = (
                (diceAdvantage * 2) + 
                (strategicValue * 3) + 
                targetValue + 
                chokePointValue -
                (attackRisk * (1 - strategy.riskTolerance) * 5)
            );
            
            moves.push({
                from: i,
                to: j,
                value: moveValue,
                diceAdvantage: diceAdvantage,
                risk: attackRisk,
                strategicValue: strategicValue,
                isChokePoint: chokePointValue > 0
            });
        }
    }
    
    // Sort by value (highest first)
    moves.sort((a, b) => b.value - a.value);
    
    return moves;
}

/**
 * Calculate territory information including neighboring territory analysis
 * 
 * @param {Object} game - The game state object
 * @returns {Array} Information about each territory's neighbors
 */
function calculateAreaInfo(game) {
    const info = [];
    
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size === 0) {
            info[i] = null;
            continue;
        }
        
        let friendly_neighbors = 0;
        let unfriendly_neighbors = 0;
        let highest_friendly_neighbor_dice = 0;
        let highest_unfriendly_neighbor_dice = 0;
        let second_highest_unfriendly_neighbor_dice = 0;
        let num_neighbors = 0;
        
        const owner = game.adat[i].arm;
        
        for (let j = 1; j < game.AREA_MAX; j++) {
            if (j === i) continue;
            if (game.adat[j].size === 0) continue;
            if (!game.adat[i].join[j]) continue;
            
            num_neighbors++;
            const neighborDice = game.adat[j].dice;
            
            if (game.adat[j].arm === owner) {
                friendly_neighbors++;
                if (neighborDice > highest_friendly_neighbor_dice) {
                    highest_friendly_neighbor_dice = neighborDice;
                }
            } else {
                unfriendly_neighbors++;
                if (neighborDice > highest_unfriendly_neighbor_dice) {
                    second_highest_unfriendly_neighbor_dice = highest_unfriendly_neighbor_dice;
                    highest_unfriendly_neighbor_dice = neighborDice;
                } else if (neighborDice > second_highest_unfriendly_neighbor_dice) {
                    second_highest_unfriendly_neighbor_dice = neighborDice;
                }
            }
        }
        
        info[i] = {
            friendly_neighbors: friendly_neighbors,
            unfriendly_neighbors: unfriendly_neighbors,
            highest_friendly_neighbor_dice: highest_friendly_neighbor_dice,
            highest_unfriendly_neighbor_dice: highest_unfriendly_neighbor_dice,
            second_highest_unfriendly_neighbor_dice: second_highest_unfriendly_neighbor_dice,
            num_neighbors: num_neighbors
        };
    }
    
    return info;
}

/**
 * Calculate the risk of an attack based on multiple factors
 * 
 * @param {Object} game - The game state object
 * @param {number} from - Attacking territory ID
 * @param {number} to - Defending territory ID
 * @param {Array} areaInfo - Pre-calculated territory information
 * @returns {number} Risk factor between 0 (low risk) and 1 (high risk)
 */
function calculateAttackRisk(game, from, to, areaInfo) {
    let risk = 0;
    
    // Base risk from dice ratio
    const diceRatio = game.adat[to].dice / game.adat[from].dice;
    risk += diceRatio * 0.5;
    
    // Risk from exposing the attacking territory
    const exposureRisk = areaInfo[from].unfriendly_neighbors / 6; // Normalize to 0-1
    risk += exposureRisk * 0.3;
    
    // Risk from attacking a territory with strong friendly support
    if (areaInfo[to].highest_friendly_neighbor_dice > game.adat[from].dice - 1) {
        risk += 0.3;
    }
    
    // Risk from breaking a strong connected territory
    let connectivityRisk = 0;
    if (areaInfo[from].friendly_neighbors === 1) {
        connectivityRisk = 0.2;
    }
    risk += connectivityRisk;
    
    return Math.min(1, risk); // Ensure risk is between 0 and 1
}

/**
 * Calculate the strategic value of an attack
 * 
 * @param {Object} game - The game state object
 * @param {number} from - Attacking territory ID
 * @param {number} to - Defending territory ID
 * @param {Array} areaInfo - Pre-calculated territory information
 * @param {Object} strategy - Strategic parameters
 * @returns {number} Strategic value of the attack
 */
function calculateStrategicValue(game, from, to, areaInfo, strategy) {
    let value = 0;
    
    // Value from expansion vs. consolidation strategy
    if (strategy.expansion > 0.5) {
        // Expansion value - favor territories that open up new attack options
        value += areaInfo[to].unfriendly_neighbors * 0.2 * strategy.expansion;
    } else {
        // Consolidation value - favor territories that reduce our exposed border
        const borderReduction = simulateBorderReduction(game, from, to);
        value += borderReduction * 0.3 * (1 - strategy.expansion);
    }
    
    // Value from aggression strategy
    if (strategy.aggression > 0.5) {
        // Aggressive value - favor high-dice territories
        value += game.adat[to].dice * 0.1 * strategy.aggression;
    } else {
        // Defensive value - favor territories that improve our defensive position
        const defensiveImprovement = simulateDefensiveImprovement(game, from, to);
        value += defensiveImprovement * 0.2 * (1 - strategy.aggression);
    }
    
    // Value from connectivity improvement
    const connectivityValue = simulateConnectivityImprovement(game, from, to);
    value += connectivityValue * 0.3;
    
    return value;
}

/**
 * Find the weakest active player based on dice count
 * 
 * @param {Object} game - The game state object
 * @returns {number} Player number of the weakest active player
 */
function findWeakestPlayer(game) {
    let weakestPlayer = -1;
    let minDice = Infinity;
    
    for (let i = 0; i < 8; i++) {
        if (game.player[i].area_c === 0) continue; // Skip inactive players
        
        if (game.player[i].dice_c < minDice) {
            minDice = game.player[i].dice_c;
            weakestPlayer = i;
        }
    }
    
    return weakestPlayer;
}

/**
 * Check if a territory is a strategic choke point
 * 
 * @param {Object} game - The game state object
 * @param {number} territory - Territory ID to check
 * @returns {boolean} True if the territory is a choke point
 */
function isChokePoint(game, territory) {
    // Basic implementation - count connected players
    const connectedPlayers = new Set();
    
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size === 0) continue;
        if (!game.adat[territory].join[i]) continue;
        
        connectedPlayers.add(game.adat[i].arm);
    }
    
    // A territory connecting multiple players is likely a choke point
    return connectedPlayers.size >= 3;
}

/**
 * Simulate how an attack would reduce our border exposure
 * 
 * @param {Object} game - The game state object
 * @param {number} from - Attacking territory ID
 * @param {number} to - Defending territory ID
 * @returns {number} Estimated border reduction factor
 */
function simulateBorderReduction(game, from, to) {
    const pn = game.get_pn();
    
    // Count our current border territories
    let currentBorders = 0;
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size === 0) continue;
        if (game.adat[i].arm !== pn) continue;
        
        // Check if this is a border territory
        let isBorder = false;
        for (let j = 1; j < game.AREA_MAX; j++) {
            if (game.adat[j].size === 0) continue;
            if (!game.adat[i].join[j]) continue;
            
            if (game.adat[j].arm !== pn) {
                isBorder = true;
                break;
            }
        }
        
        if (isBorder) currentBorders++;
    }
    
    // Simulate capturing the target territory
    const originalOwner = game.adat[to].arm;
    game.adat[to].arm = pn;
    
    // Count our borders after the simulated capture
    let newBorders = 0;
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size === 0) continue;
        if (game.adat[i].arm !== pn) continue;
        
        // Check if this is a border territory
        let isBorder = false;
        for (let j = 1; j < game.AREA_MAX; j++) {
            if (game.adat[j].size === 0) continue;
            if (!game.adat[i].join[j]) continue;
            
            if (game.adat[j].arm !== pn) {
                isBorder = true;
                break;
            }
        }
        
        if (isBorder) newBorders++;
    }
    
    // Restore original state
    game.adat[to].arm = originalOwner;
    
    // Calculate border reduction
    const reduction = (currentBorders - newBorders + 1) / currentBorders;
    return Math.max(0, reduction);
}

/**
 * Simulate how an attack would improve our defensive position
 * 
 * @param {Object} game - The game state object
 * @param {number} from - Attacking territory ID
 * @param {number} to - Defending territory ID
 * @returns {number} Estimated defensive improvement factor
 */
function simulateDefensiveImprovement(game, from, to) {
    const pn = game.get_pn();
    
    // Count initial threat level (enemy dice adjacent to our territories)
    let initialThreat = 0;
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size === 0) continue;
        if (game.adat[i].arm !== pn) continue;
        
        for (let j = 1; j < game.AREA_MAX; j++) {
            if (game.adat[j].size === 0) continue;
            if (!game.adat[i].join[j]) continue;
            
            if (game.adat[j].arm !== pn) {
                initialThreat += game.adat[j].dice;
            }
        }
    }
    
    // Simulate capturing the target territory
    const originalOwner = game.adat[to].arm;
    game.adat[to].arm = pn;
    
    // Count threat level after the simulated capture
    let newThreat = 0;
    for (let i = 1; i < game.AREA_MAX; i++) {
        if (game.adat[i].size === 0) continue;
        if (game.adat[i].arm !== pn) continue;
        
        for (let j = 1; j < game.AREA_MAX; j++) {
            if (game.adat[j].size === 0) continue;
            if (!game.adat[i].join[j]) continue;
            
            if (game.adat[j].arm !== pn) {
                newThreat += game.adat[j].dice;
            }
        }
    }
    
    // Restore original state
    game.adat[to].arm = originalOwner;
    
    // Calculate threat reduction
    if (initialThreat === 0) return 0;
    const reduction = (initialThreat - newThreat) / initialThreat;
    return Math.max(0, reduction);
}

/**
 * Simulate how an attack would improve our territory connectivity
 * 
 * @param {Object} game - The game state object
 * @param {number} from - Attacking territory ID
 * @param {number} to - Defending territory ID
 * @returns {number} Estimated connectivity improvement factor
 */
function simulateConnectivityImprovement(game, from, to) {
    const pn = game.get_pn();
    
    // Save original connected territory count
    const originalConnected = game.player[pn].area_tc;
    
    // Simulate capturing the target territory
    const originalOwner = game.adat[to].arm;
    game.adat[to].arm = pn;
    
    // Recalculate connected territories
    game.set_area_tc(pn);
    const newConnected = game.player[pn].area_tc;
    
    // Restore original state
    game.adat[to].arm = originalOwner;
    game.set_area_tc(pn);
    
    // Calculate improvement ratio
    const improvement = (newConnected - originalConnected) / Math.max(1, game.player[pn].area_c);
    return Math.max(0, improvement * 2);
}

/**
 * Select the best move from the evaluated options
 * 
 * @param {Array} moves - Sorted list of possible moves
 * @param {Object} strategy - Strategic parameters
 * @returns {Object} The selected move to execute
 */
function selectBestMove(moves, strategy) {
    if (moves.length === 0) return null;
    
    // Usually select the highest valued move
    
    // Add some randomness based on risk tolerance
    if (Math.random() < strategy.riskTolerance * 0.3) {
        // Select from top moves (more options with higher risk tolerance)
        const topCount = Math.max(1, Math.ceil(moves.length * strategy.riskTolerance * 0.5));
        const topMoves = moves.slice(0, Math.min(topCount, moves.length));
        return topMoves[Math.floor(Math.random() * topMoves.length)];
    }
    
    return moves[0];
}