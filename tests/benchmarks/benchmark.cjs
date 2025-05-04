/**
 * AI Strategy Benchmark Runner (CommonJS version)
 * 
 * A simplified version of the benchmark runner using CommonJS module system
 * for better compatibility with the existing project structure.
 * 
 * Run with: node tests/benchmarks/benchmark.cjs
 */

// Use require() instead of import
const path = require('path');
const fs = require('fs');
const jest = require('jest');

// Configuration
const RESULTS_DIR = path.join(process.cwd(), 'benchmark-results');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

console.log('\n===== Running AI Strategy Benchmarks =====');
console.log('This will execute the benchmark tests using Jest\n');

// Set environment to enable benchmark tests
process.env.NODE_ENV = 'benchmark';

// Run the benchmark tests with increased timeouts
jest.run([
  'tests/benchmarks/ai.benchmark.js',
  '--testTimeout=30000',
  '--no-coverage'
]).then(() => {
  console.log('\n===== Benchmarks Complete =====');
  console.log(`\nBenchmark tests have completed. To run the full benchmark suite with visualizations:`);
  console.log(`1. Add "type": "module" to your package.json temporarily`);
  console.log(`2. Run: node --experimental-json-modules tests/benchmarks/runBenchmarks.js`);
  console.log(`3. Check the benchmark-results/ directory for detailed reports`);
});

/**
 * This script runs the Jest benchmark tests without ESM import issues.
 * For the full benchmark experience with visualizations, follow the
 * instructions printed after the tests complete.
 */