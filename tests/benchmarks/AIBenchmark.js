/**
 * AI Benchmark Utility
 *
 * Provides tools for benchmarking AI strategy performance, including:
 * - Execution time measurement
 * - Decision quality analysis
 * - Memory usage tracking
 * - Comparative performance reporting
 */
import { createGameMock } from '../mocks/gameMock.js';

/**
 * AIBenchmark class for measuring AI strategy performance
 */
export class AIBenchmark {
  /**
   * Create a new benchmark instance
   *
   * @param {Object} options - Benchmark configuration
   * @param {number} options.iterations - Number of benchmark iterations to run
   * @param {number} options.warmupRuns - Number of warm-up runs before measuring
   * @param {boolean} options.logResults - Whether to log results to console
   * @param {Array<Function>} options.observers - Functions to call with results
   */
  constructor(options = {}) {
    this.iterations = options.iterations || 1000;
    this.warmupRuns = options.warmupRuns || 10;
    this.logResults = options.logResults !== false;
    this.observers = options.observers || [];
    this.results = {};
  }

  /**
   * Run a benchmark test on an AI strategy function
   *
   * @param {string} name - Identifier for this benchmark run
   * @param {Function} aiFunction - The AI strategy function to benchmark
   * @param {Object} gameState - Optional preset game state for testing
   * @returns {Object} Benchmark results
   */
  measurePerformance(name, aiFunction, gameState = null) {
    if (!aiFunction) {
      throw new Error(`AI function not provided for benchmark "${name}"`);
    }

    // Store benchmark metadata
    const benchmark = {
      name,
      iterations: this.iterations,
      executionTimes: [],
      decisions: [],
      startTime: Date.now(),
      totalTime: 0,
      averageTime: 0,
      minTime: Number.MAX_SAFE_INTEGER,
      maxTime: 0,
      medianTime: 0,
    };

    // Run warm-up passes to allow JIT optimization
    this._warmUp(aiFunction, gameState);

    // Run benchmark iterations
    for (let i = 0; i < this.iterations; i++) {
      const result = this._runIteration(aiFunction, gameState);
      benchmark.executionTimes.push(result.executionTime);
      benchmark.decisions.push({
        from: result.from,
        to: result.to,
        endTurn: result.endTurn,
      });
    }

    // Calculate statistics
    benchmark.totalTime = benchmark.executionTimes.reduce((sum, time) => sum + time, 0);
    benchmark.averageTime = benchmark.totalTime / this.iterations;
    benchmark.minTime = Math.min(...benchmark.executionTimes);
    benchmark.maxTime = Math.max(...benchmark.executionTimes);

    // Calculate median (sort and take middle value)
    const sortedTimes = [...benchmark.executionTimes].sort((a, b) => a - b);
    const midIndex = Math.floor(sortedTimes.length / 2);
    benchmark.medianTime =
      sortedTimes.length % 2 === 0
        ? (sortedTimes[midIndex - 1] + sortedTimes[midIndex]) / 2
        : sortedTimes[midIndex];

    // Calculate decision consistency
    benchmark.decisionConsistency = this._calculateDecisionConsistency(benchmark.decisions);

    // Record benchmark end time
    benchmark.endTime = Date.now();
    benchmark.totalRunTime = benchmark.endTime - benchmark.startTime;

    // Store results
    this.results[name] = benchmark;

    // Log results if enabled
    if (this.logResults) {
      this._logBenchmarkResults(benchmark);
    }

    // Notify observers
    this.observers.forEach(observer => observer(benchmark));

    return benchmark;
  }

  /**
   * Run warm-up iterations (to allow for JIT optimization)
   *
   * @param {Function} aiFunction - The AI function to benchmark
   * @param {Object} gameState - Optional preset game state
   * @private
   */
  _warmUp(aiFunction, gameState) {
    for (let i = 0; i < this.warmupRuns; i++) {
      this._runIteration(aiFunction, gameState);
    }
  }

  /**
   * Run a single benchmark iteration
   *
   * @param {Function} aiFunction - The AI function to benchmark
   * @param {Object} gameState - Optional preset game state
   * @returns {Object} Results of this iteration
   * @private
   */
  _runIteration(aiFunction, gameState) {
    // Create a fresh game state for this iteration
    const mockGame = gameState || createGameMock({ currentPlayer: 1 });

    // Configure a typical game scenario if none provided
    if (!gameState) {
      // Create a simple scenario with some territories to make decisions on
      mockGame.createTerritory(1, 1, 3, { 2: 1, 3: 1 });
      mockGame.createTerritory(2, 2, 1, { 1: 1 });
      mockGame.createTerritory(3, 3, 2, { 1: 1 });
      mockGame.createTerritory(4, 1, 2, { 5: 1 });
      mockGame.createTerritory(5, 2, 1, { 4: 1 });
      mockGame.recalculatePlayerStats();
    }

    // Reset game's attack selection
    mockGame.area_from = 0;
    mockGame.area_to = 0;

    // Time the AI function execution
    const startTime = performance.now();
    const result = aiFunction(mockGame);
    const endTime = performance.now();

    // Capture timing and decisions
    return {
      executionTime: endTime - startTime,
      from: mockGame.area_from,
      to: mockGame.area_to,
      endTurn: result === 0,
    };
  }

  /**
   * Calculate how consistent the AI's decisions are
   *
   * @param {Array} decisions - The decisions made during benchmark iterations
   * @returns {Object} Decision consistency metrics
   * @private
   */
  _calculateDecisionConsistency(decisions) {
    // Count frequency of each decision type
    const counts = decisions.reduce((acc, decision) => {
      const key = decision.endTurn ? 'endTurn' : `${decision.from}->${decision.to}`;

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Convert to array of [decision, count] pairs and sort by frequency
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    // Calculate consistency percentages
    const totalDecisions = decisions.length;
    const percentages = sorted.map(([key, count]) => ({
      decision: key,
      count,
      percentage: (count / totalDecisions) * 100,
    }));

    return {
      totalDecisions,
      uniqueDecisions: sorted.length,
      mostCommon: sorted.length > 0 ? sorted[0] : null,
      percentages,
    };
  }

  /**
   * Log benchmark results to console
   *
   * @param {Object} benchmark - The benchmark results to log
   * @private
   */
  _logBenchmarkResults(benchmark) {
    console.log(`\n===== AI Benchmark: ${benchmark.name} =====`);
    console.log(`Iterations: ${benchmark.iterations}`);
    console.log(`Total runtime: ${benchmark.totalRunTime}ms`);
    console.log(`\nPerformance:`);
    console.log(`  Average execution time: ${benchmark.averageTime.toFixed(3)}ms`);
    console.log(`  Median execution time: ${benchmark.medianTime.toFixed(3)}ms`);
    console.log(`  Min execution time: ${benchmark.minTime.toFixed(3)}ms`);
    console.log(`  Max execution time: ${benchmark.maxTime.toFixed(3)}ms`);

    console.log(`\nDecision Consistency:`);
    console.log(`  Unique decisions: ${benchmark.decisionConsistency.uniqueDecisions}`);
    if (benchmark.decisionConsistency.mostCommon) {
      const [decision, count] = benchmark.decisionConsistency.mostCommon;
      const percentage = (count / benchmark.iterations) * 100;
      console.log(
        `  Most common decision: "${decision}" (${count} times, ${percentage.toFixed(1)}%)`
      );
    }

    // Print top 3 most common decisions
    console.log('\n  Top decisions:');
    benchmark.decisionConsistency.percentages.slice(0, 3).forEach(item => {
      console.log(`    ${item.decision}: ${item.count} times (${item.percentage.toFixed(1)}%)`);
    });
  }

  /**
   * Compare multiple AI strategies
   *
   * @param {Array} aiStrategies - Array of {name, function} objects to compare
   * @param {Object} gameState - Optional preset game state for consistent comparison
   * @returns {Object} Comparative benchmark results
   */
  compareStrategies(aiStrategies, gameState = null) {
    // Run benchmarks for all strategies using the same game state
    aiStrategies.forEach(strategy => {
      this.measurePerformance(strategy.name, strategy.function, gameState);
    });

    // Comparative analysis
    if (this.logResults) {
      this._logComparisonResults(aiStrategies.map(s => s.name));
    }

    return this.results;
  }

  /**
   * Log comparison results to console
   *
   * @param {Array} strategyNames - Names of strategies to compare
   * @private
   */
  _logComparisonResults(strategyNames) {
    console.log('\n===== AI Strategy Comparison =====');
    console.log('Performance (average execution time in ms):');

    // Calculate width for alignment
    const maxNameLength = Math.max(...strategyNames.map(name => name.length));

    // Sort by average execution time (fastest first)
    const sortedBySpeed = [...strategyNames].sort(
      (a, b) => this.results[a].averageTime - this.results[b].averageTime
    );

    // Display performance comparison
    sortedBySpeed.forEach((name, index) => {
      const result = this.results[name];
      const padding = ' '.repeat(maxNameLength - name.length);
      console.log(
        `${index + 1}. ${name}${padding}: ${result.averageTime.toFixed(3)}ms` +
          ` (median: ${result.medianTime.toFixed(3)}ms)`
      );
    });

    // Display decision consistency comparison
    console.log('\nDecision Consistency:');
    strategyNames.forEach(name => {
      const result = this.results[name];
      const padding = ' '.repeat(maxNameLength - name.length);
      const consistency = result.decisionConsistency;

      console.log(`${name}${padding}: ${consistency.uniqueDecisions} unique decisions`);
      if (consistency.mostCommon) {
        const [decision, count] = consistency.mostCommon;
        const percentage = (count / result.iterations) * 100;
        console.log(`  Most common: "${decision}" (${percentage.toFixed(1)}%)`);
      }
    });
  }
}

/**
 * Helper function to create a standard game state for benchmark comparisons
 * Creates a mid-game scenario with multiple territories and players
 *
 * @returns {Object} A mock game object with a standardized scenario
 */
export function createBenchmarkGameState() {
  const mockGame = createGameMock({
    currentPlayer: 1,
    usePlayerDataModel: true,
  });

  // Create a balanced mid-game scenario with 3 players
  // Player 1 (current player)
  mockGame.createTerritory(1, 1, 3, { 2: 1, 6: 1 });
  mockGame.createTerritory(3, 1, 2, { 4: 1, 7: 1 });
  mockGame.createTerritory(5, 1, 4, { 9: 1 });
  mockGame.createTerritory(12, 1, 3, { 8: 1, 11: 1 });
  mockGame.createTerritory(15, 1, 1, { 11: 1 });

  // Player 2
  mockGame.createTerritory(2, 2, 1, { 1: 1, 6: 1 });
  mockGame.createTerritory(6, 2, 3, { 1: 1, 2: 1, 7: 1, 10: 1 });
  mockGame.createTerritory(9, 2, 2, { 5: 1, 10: 1 });
  mockGame.createTerritory(10, 2, 5, { 6: 1, 9: 1, 11: 1 });

  // Player 3
  mockGame.createTerritory(4, 3, 1, { 3: 1, 8: 1 });
  mockGame.createTerritory(7, 3, 2, { 3: 1, 6: 1, 8: 1 });
  mockGame.createTerritory(8, 3, 3, { 4: 1, 7: 1, 12: 1 });
  mockGame.createTerritory(11, 3, 2, { 10: 1, 12: 1, 15: 1 });

  // Recalculate player stats and rankings
  mockGame.recalculatePlayerStats();
  mockGame.setPlayerRankings();

  return mockGame;
}

/**
 * Run a quick benchmark for a single AI function
 * Convenience function for simple benchmarking
 *
 * @param {string} name - Name of the AI strategy
 * @param {Function} aiFunction - AI strategy function to benchmark
 * @param {Object} options - Benchmark options
 * @returns {Object} Benchmark results
 */
export function quickBenchmark(name, aiFunction, options = {}) {
  const benchmark = new AIBenchmark({
    iterations: options.iterations || 100,
    warmupRuns: options.warmupRuns || 5,
    logResults: options.logResults !== false,
  });

  return benchmark.measurePerformance(name, aiFunction, options.gameState);
}
