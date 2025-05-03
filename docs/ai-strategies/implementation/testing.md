# Testing and Tuning

This guide covers effective approaches for testing and tuning your DiceWars AI to ensure it performs as expected and can be systematically improved.

## Testing Challenges

Testing AI implementations presents unique challenges:

1. **Non-deterministic behavior** - Random elements make exact test cases difficult
2. **Emergent complexity** - Simple rules can lead to complex behavior
3. **Game-long effects** - Early decisions affect late-game outcomes
4. **Performance variability** - The AI may perform well in some situations and poorly in others
5. **Multi-agent dynamics** - AI behavior changes when playing against different opponents

## Testing Approaches

### 1. AI vs. AI Tournaments

The most effective way to test your AI is to have it play against other AI implementations:

```javascript
// Simple tournament runner
function runTournament(aiList, numGames = 100) {
    const wins = new Array(aiList.length).fill(0);
    const scores = new Array(aiList.length).fill(0);
    
    for (let gameNum = 0; gameNum < numGames; gameNum++) {
        // Initialize a new game with random map
        const game = new Game();
        game.make_map();
        
        // Assign AIs to players
        for (let i = 0; i < aiList.length; i++) {
            game.ai[i] = aiList[i];
        }
        
        // Run the game until completion
        const winner = runGameToCompletion(game);
        
        // Record results
        if (winner >= 0) {
            wins[winner]++;
        }
        
        // Record scores (e.g., territories controlled, dice owned)
        for (let i = 0; i < aiList.length; i++) {
            scores[i] += calculateScore(game, i);
        }
    }
    
    // Output results
    for (let i = 0; i < aiList.length; i++) {
        console.log(`AI ${i}: ${wins[i]} wins, average score: ${scores[i] / numGames}`);
    }
}

function runGameToCompletion(game) {
    game.start_game();
    
    // Set a reasonable limit to avoid infinite games
    const MAX_TURNS = 1000;
    let turnCount = 0;
    
    while (turnCount < MAX_TURNS) {
        // Check win condition
        const remainingPlayers = countRemainingPlayers(game);
        if (remainingPlayers === 1) {
            // Return the winner
            for (let i = 0; i < 8; i++) {
                if (game.player[i].area_c > 0) return i;
            }
        }
        
        // No winner yet, continue game
        while (true) {
            // Process one AI turn
            const pn = game.jun[game.ban];
            const result = game.ai[pn](game);
            
            // If the AI returns 0, end its turn
            if (result === 0) break;
            
            // Otherwise, process the attack
            processAttack(game);
        }
        
        // Move to next player
        advanceToNextPlayer(game);
        turnCount++;
    }
    
    // If no clear winner after MAX_TURNS, return the player with most territories
    let bestPlayer = -1;
    let mostTerritories = 0;
    for (let i = 0; i < 8; i++) {
        if (game.player[i].area_c > mostTerritories) {
            mostTerritories = game.player[i].area_c;
            bestPlayer = i;
        }
    }
    
    return bestPlayer;
}
```

### 2. Specific Scenario Testing

Create specific game states to test how your AI handles certain situations:

```javascript
// Test handling of choke points
function testChokePointHandling(aiFunction) {
    // Create a game with a predefined map containing choke points
    const game = createChokePointMap();
    
    // Set the AI we're testing
    game.ai[1] = aiFunction;
    
    // Set up the specific scenario
    // Player 1 has territories on both sides of a choke point
    // Enemy player 2 controls the choke point
    setupChokePointScenario(game);
    
    // Run the AI and see if it targets the choke point
    const result = aiFunction(game);
    
    // Check if the AI correctly identified and attacked the choke point
    if (game.area_to === CHOKE_POINT_TERRITORY) {
        return "PASS: AI correctly targeted the choke point";
    } else {
        return "FAIL: AI did not target the choke point";
    }
}

// Test defensive behavior when threatened
function testDefensiveBehavior(aiFunction) {
    // Create a game with a predefined map
    const game = createTestMap();
    
    // Set the AI we're testing
    game.ai[1] = aiFunction;
    
    // Set up the specific scenario
    // Player 1 has a vulnerable territory with a strong enemy adjacent
    setupThreatenedScenario(game);
    
    // Run the AI and check if it avoids attacking from the threatened territory
    const result = aiFunction(game);
    
    // The AI should not attack from the threatened territory
    if (game.area_from !== THREATENED_TERRITORY) {
        return "PASS: AI correctly avoided attacking from the threatened territory";
    } else {
        return "FAIL: AI attacked from a threatened territory";
    }
}
```

### 3. Unit Testing Strategy Components

Test individual components of your AI strategy:

```javascript
// Test territory evaluation function
function testTerritoryEvaluation() {
    const game = createTestMap();
    
    // Set up specific territories with known characteristics
    const borderTerritory = 5;
    const internalTerritory = 10;
    const chokePointTerritory = 15;
    
    // Evaluate each territory
    const borderValue = evaluateTerritory(game, borderTerritory);
    const internalValue = evaluateTerritory(game, internalTerritory);
    const chokePointValue = evaluateTerritory(game, chokePointTerritory);
    
    // Check that the evaluations match expectations
    console.assert(borderValue < internalValue, 
                  "Border territory should be less valuable than internal territory");
    
    console.assert(chokePointValue > borderValue,
                  "Choke point should be more valuable than regular border territory");
    
    // Additional assertions...
}

// Test move generation and filtering
function testMoveGeneration() {
    const game = createTestMap();
    
    // Set up a known game state
    // ...
    
    // Generate moves
    const moves = generateMoves(game, DEFAULT_STRATEGY, 1);
    
    // Verify move count
    console.assert(moves.length === EXPECTED_MOVE_COUNT,
                  `Expected ${EXPECTED_MOVE_COUNT} moves, got ${moves.length}`);
    
    // Verify specific moves are included
    const hasExpectedMove = moves.some(move => 
        move.from === EXPECTED_FROM && move.to === EXPECTED_TO);
    
    console.assert(hasExpectedMove, 
                  "Expected move not found in generated moves");
    
    // Verify invalid moves are excluded
    const hasInvalidMove = moves.some(move =>
        move.from === INVALID_FROM && move.to === INVALID_TO);
    
    console.assert(!hasInvalidMove,
                  "Invalid move was incorrectly included");
}
```

### 4. Comparative Analysis

Compare your AI's decisions with those of other AI implementations:

```javascript
function compareAIDecisions(aiList, game) {
    const decisions = [];
    
    // Clone the game state for each AI
    for (let i = 0; i < aiList.length; i++) {
        const gameCopy = cloneGameState(game);
        
        // Run the AI
        aiList[i](gameCopy);
        
        // Record the decision
        decisions.push({
            ai: i,
            from: gameCopy.area_from,
            to: gameCopy.area_to
        });
    }
    
    // Analyze the decisions
    console.log("AI decisions for the same game state:");
    for (const decision of decisions) {
        if (decision.from === 0 && decision.to === 0) {
            console.log(`AI ${decision.ai} chose to end turn`);
        } else {
            console.log(`AI ${decision.ai} attacked from ${decision.from} to ${decision.to}`);
        }
    }
    
    // Find consensus or disagreement
    const uniqueDecisions = new Set(decisions.map(d => `${d.from}-${d.to}`));
    if (uniqueDecisions.size === 1) {
        console.log("All AIs made the same decision");
    } else {
        console.log(`AIs disagreed, with ${uniqueDecisions.size} different decisions`);
    }
}
```

## Tuning Approaches

### 1. Parameter Tuning

Most AI strategies have parameters that can be tuned to optimize performance:

```javascript
// AI with tunable parameters
function ai_tunable(game) {
    // Strategy parameters
    const params = {
        // Aggression parameters
        AGGRESSION_LEVEL: 0.6,         // 0-1 scale (0 = defensive, 1 = aggressive)
        RISK_TOLERANCE: 0.4,           // 0-1 scale (0 = risk-averse, 1 = risk-seeking)
        
        // Evaluation weights
        DICE_ADVANTAGE_WEIGHT: 2.0,
        STRATEGIC_POSITION_WEIGHT: 1.5,
        CONNECTIVITY_WEIGHT: 1.0,
        BORDER_REDUCTION_WEIGHT: 1.2,
        
        // Thresholds
        MIN_DICE_ADVANTAGE: 1,         // Minimum dice advantage for an attack
        MAX_BORDER_EXPOSURE: 3,        // Maximum number of exposed borders
    };
    
    // Implementation using these parameters
    // ...
}

// Systematic parameter tuning
function tuneParameters() {
    // Define the parameter to tune and its range
    const paramToTune = 'AGGRESSION_LEVEL';
    const values = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
    
    const results = [];
    
    // Test each value
    for (const value of values) {
        // Create a version of the AI with this parameter value
        const tunedAI = createTunedAI(paramToTune, value);
        
        // Run a tournament with this AI
        const winRate = runTournament([tunedAI, ai_default, ai_defensive], 50);
        
        results.push({
            value,
            winRate
        });
    }
    
    // Find the optimal value
    results.sort((a, b) => b.winRate - a.winRate);
    
    console.log(`Optimal value for ${paramToTune}: ${results[0].value} (win rate: ${results[0].winRate})`);
    return results;
}

function createTunedAI(paramName, value) {
    return function(game) {
        // Clone the default parameters
        const params = { ...DEFAULT_PARAMS };
        
        // Override the specified parameter
        params[paramName] = value;
        
        // Run the AI implementation with these parameters
        return ai_implementation(game, params);
    };
}
```

### 2. Grid Search

For tuning multiple parameters, use a grid search:

```javascript
function gridSearch() {
    // Define parameter ranges
    const parameterRanges = {
        AGGRESSION_LEVEL: [0.4, 0.6, 0.8],
        RISK_TOLERANCE: [0.3, 0.5, 0.7],
        DICE_ADVANTAGE_WEIGHT: [1.5, 2.0, 2.5]
    };
    
    // Generate all combinations
    const parameterCombinations = generateParameterCombinations(parameterRanges);
    
    // Test each combination
    const results = [];
    
    for (const params of parameterCombinations) {
        const tunedAI = createAIWithParams(params);
        const winRate = runTournament([tunedAI, ai_default, ai_defensive], 20);
        
        results.push({
            params,
            winRate
        });
    }
    
    // Sort by win rate
    results.sort((a, b) => b.winRate - a.winRate);
    
    // Return the top 3 parameter combinations
    return results.slice(0, 3);
}

function generateParameterCombinations(ranges) {
    const keys = Object.keys(ranges);
    const combinations = [{}];
    
    for (const key of keys) {
        const values = ranges[key];
        const newCombinations = [];
        
        for (const value of values) {
            for (const combo of combinations) {
                newCombinations.push({
                    ...combo,
                    [key]: value
                });
            }
        }
        
        combinations.length = 0;
        combinations.push(...newCombinations);
    }
    
    return combinations;
}
```

### 3. Evolutionary Algorithms

For complex parameter spaces, evolutionary algorithms can be effective:

```javascript
function evolveParameters(numGenerations = 10) {
    // Initial population with random parameters
    let population = generateInitialPopulation(20);
    
    for (let generation = 0; generation < numGenerations; generation++) {
        // Evaluate fitness of all individuals
        const fitnessScores = evaluatePopulationFitness(population);
        
        // Select parents for the next generation
        const parents = selectParents(population, fitnessScores);
        
        // Create offspring through crossover and mutation
        const offspring = createOffspring(parents);
        
        // Replace the population with the new generation
        population = [...parents.slice(0, 5), ...offspring];
        
        // Log the best parameters in this generation
        const bestIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
        console.log(`Generation ${generation + 1} best:`, population[bestIndex]);
    }
    
    // Return the best individual from the final generation
    const finalFitness = evaluatePopulationFitness(population);
    const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
    
    return population[bestIndex];
}

function generateInitialPopulation(size) {
    const population = [];
    
    for (let i = 0; i < size; i++) {
        population.push({
            AGGRESSION_LEVEL: Math.random(),
            RISK_TOLERANCE: Math.random(),
            DICE_ADVANTAGE_WEIGHT: 1 + Math.random() * 2,
            STRATEGIC_POSITION_WEIGHT: 1 + Math.random() * 2,
            CONNECTIVITY_WEIGHT: 1 + Math.random() * 2
        });
    }
    
    return population;
}

function evaluatePopulationFitness(population) {
    const fitnessScores = [];
    
    for (const params of population) {
        const ai = createAIWithParams(params);
        const winRate = runTournament([ai, ai_default, ai_defensive], 10);
        fitnessScores.push(winRate);
    }
    
    return fitnessScores;
}

function selectParents(population, fitnessScores) {
    // Sort population by fitness
    const sortedPopulation = population
        .map((params, index) => ({ params, fitness: fitnessScores[index] }))
        .sort((a, b) => b.fitness - a.fitness);
    
    // Return the top half as parents
    return sortedPopulation
        .slice(0, Math.ceil(population.length / 2))
        .map(entry => entry.params);
}

function createOffspring(parents) {
    const offspring = [];
    
    while (offspring.length < parents.length) {
        // Select two parents randomly
        const parent1 = parents[Math.floor(Math.random() * parents.length)];
        const parent2 = parents[Math.floor(Math.random() * parents.length)];
        
        // Create a child through crossover
        const child = crossover(parent1, parent2);
        
        // Apply mutation
        mutate(child);
        
        offspring.push(child);
    }
    
    return offspring;
}

function crossover(parent1, parent2) {
    const child = {};
    
    // For each parameter, randomly select from either parent
    for (const key in parent1) {
        child[key] = Math.random() < 0.5 ? parent1[key] : parent2[key];
    }
    
    return child;
}

function mutate(params) {
    // Small chance to mutate each parameter
    for (const key in params) {
        if (Math.random() < 0.2) { // 20% mutation chance
            // Apply a small random adjustment
            const mutationAmount = (Math.random() - 0.5) * 0.2; // ±10%
            params[key] += params[key] * mutationAmount;
            
            // Ensure values stay in reasonable ranges
            if (key.includes('LEVEL') || key.includes('TOLERANCE')) {
                params[key] = Math.max(0, Math.min(1, params[key]));
            } else {
                params[key] = Math.max(0.1, params[key]);
            }
        }
    }
}
```

## Performance Metrics

For comprehensive evaluation, track multiple metrics beyond just win rate:

```javascript
function evaluateAI(aiFunction, numGames = 100) {
    const metrics = {
        wins: 0,
        territoriesControlled: [],
        diceOwned: [],
        averageTurnLength: [],
        survivalTurns: [],
        eliminationsPerformed: []
    };
    
    for (let gameNum = 0; gameNum < numGames; gameNum++) {
        const game = new Game();
        game.make_map();
        
        // Assign the AI to player 1
        game.ai[1] = aiFunction;
        
        // Fill other players with default AI
        for (let i = 2; i < 8; i++) {
            game.ai[i] = ai_default;
        }
        
        // Run the game and collect metrics
        const gameMetrics = runGameAndTrackMetrics(game, 1);
        
        // Aggregate metrics
        if (gameMetrics.winner === 1) metrics.wins++;
        metrics.territoriesControlled.push(gameMetrics.maxTerritories);
        metrics.diceOwned.push(gameMetrics.maxDice);
        metrics.averageTurnLength.push(gameMetrics.avgTurnLength);
        metrics.survivalTurns.push(gameMetrics.survivalTurns);
        metrics.eliminationsPerformed.push(gameMetrics.eliminations);
    }
    
    // Calculate final metrics
    const winRate = metrics.wins / numGames;
    const avgTerritories = average(metrics.territoriesControlled);
    const avgDice = average(metrics.diceOwned);
    const avgTurnLength = average(metrics.averageTurnLength);
    const avgSurvival = average(metrics.survivalTurns);
    const avgEliminations = average(metrics.eliminationsPerformed);
    
    return {
        winRate,
        avgTerritories,
        avgDice,
        avgTurnLength,
        avgSurvival,
        avgEliminations
    };
}

function average(array) {
    return array.reduce((sum, value) => sum + value, 0) / array.length;
}
```

## Visualizing Results

Visual analysis helps identify patterns and opportunities for improvement:

```javascript
function visualizeResults(results) {
    // Assuming results is an array of metrics from multiple AIs
    
    // Compare win rates
    console.log("Win Rates:");
    for (let i = 0; i < results.length; i++) {
        const winPercentage = results[i].winRate * 100;
        console.log(`AI ${i}: ${'#'.repeat(Math.round(winPercentage / 2))} ${winPercentage.toFixed(1)}%`);
    }
    
    // Compare territory control
    console.log("\nAverage Max Territories Controlled:");
    for (let i = 0; i < results.length; i++) {
        const territories = results[i].avgTerritories;
        console.log(`AI ${i}: ${'#'.repeat(Math.round(territories))} ${territories.toFixed(1)}`);
    }
    
    // Compare survival turns
    console.log("\nAverage Survival Turns:");
    for (let i = 0; i < results.length; i++) {
        const turns = results[i].avgSurvival;
        console.log(`AI ${i}: ${'#'.repeat(Math.round(turns / 10))} ${turns.toFixed(1)}`);
    }
    
    // Additional visualizations...
}
```

## Regression Testing

Ensure changes don't break existing functionality:

```javascript
function regressionTest(newAI, baselineAI) {
    console.log("Running regression tests...");
    
    // Test 1: Win rate against standard opponents
    const winRateNew = evaluateAI(newAI).winRate;
    const winRateBaseline = evaluateAI(baselineAI).winRate;
    
    console.log(`Win rate - Baseline: ${(winRateBaseline * 100).toFixed(1)}%, New: ${(winRateNew * 100).toFixed(1)}%`);
    console.log(`Change: ${((winRateNew - winRateBaseline) * 100).toFixed(1)}%`);
    
    // Test 2: Specific scenarios
    const scenarioTests = [
        testChokePointHandling,
        testDefensiveBehavior,
        testEqualDiceHandling
    ];
    
    for (const test of scenarioTests) {
        const resultBaseline = test(baselineAI);
        const resultNew = test(newAI);
        
        console.log(`${test.name}:`);
        console.log(`  Baseline: ${resultBaseline}`);
        console.log(`  New: ${resultNew}`);
    }
    
    // Test 3: Performance metrics
    console.time("Baseline AI - 10 games");
    evaluateAI(baselineAI, 10);
    console.timeEnd("Baseline AI - 10 games");
    
    console.time("New AI - 10 games");
    evaluateAI(newAI, 10);
    console.timeEnd("New AI - 10 games");
}
```

## Best Practices

1. **Version control** - Keep track of AI versions and their performance
2. **Parameter documentation** - Document what each parameter does and its sensible range
3. **Regular benchmarking** - Re-test AI against standard opponents periodically
4. **Focused changes** - Change one aspect at a time to understand effects
5. **Randomized seeds** - Test with various random seeds for fairness
6. **A/B testing** - Compare specific changes with a baseline
7. **Statistical significance** - Run enough games to ensure results aren't due to chance
8. **Diverse opponents** - Test against a variety of AI strategies
9. **Edge cases** - Create specific scenarios to test unusual situations
10. **User feedback** - Get input from human players about AI behavior

## Common Testing Pitfalls

1. **Overfitting** - AI that works well on test cases but not in real games
2. **Non-deterministic failures** - Bugs that only appear sometimes
3. **Shallow testing** - Only testing a few game states
4. **Ignoring performance** - Creating an AI that's theoretically excellent but too slow
5. **Not documenting tests** - Making changes without tracking their effects

## Iterative Improvement Workflow

1. **Baseline** - Establish current performance
2. **Hypothesis** - Identify potential improvement
3. **Implementation** - Make the change
4. **Testing** - Run rigorous tests
5. **Analysis** - Compare with baseline
6. **Refinement** - Tune parameters
7. **Documentation** - Record findings
8. **Repeat** - Continue the cycle