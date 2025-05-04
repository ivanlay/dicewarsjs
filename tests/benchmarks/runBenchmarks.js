#!/usr/bin/env node
/**
 * AI Strategy Benchmark Runner
 * 
 * Command-line script to run benchmarks and generate reports
 * Run with: node --input-type=module tests/benchmarks/runBenchmarks.js
 * 
 * @type {module}
 */
import { AIBenchmark, createBenchmarkGameState } from './AIBenchmark.js';
import { ai_example } from '../../src/ai/ai_example.js';
import { ai_default } from '../../src/ai/ai_default.js';
import { ai_defensive } from '../../src/ai/ai_defensive.js';
import { ai_adaptive } from '../../src/ai/ai_adaptive.js';
import fs from 'fs';
import path from 'path';

// Configuration
const ITERATIONS = 1000;        // Number of iterations for simple AIs
const COMPLEX_ITERATIONS = 200; // Number of iterations for complex AIs
const WARMUP_RUNS = 10;
const RESULTS_DIR = path.join(process.cwd(), 'benchmark-results');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Set up the benchmark environment
const standardGameState = createBenchmarkGameState();

// Create benchmark instances for different complexity levels
const simpleBenchmark = new AIBenchmark({
  iterations: ITERATIONS,
  warmupRuns: WARMUP_RUNS,
  logResults: true
});

const complexBenchmark = new AIBenchmark({
  iterations: COMPLEX_ITERATIONS,
  warmupRuns: WARMUP_RUNS,
  logResults: true
});

// Run individual benchmarks
console.log('\n===== Running Individual AI Benchmarks =====');

console.log('\n>> Benchmarking Example AI...');
const exampleResult = simpleBenchmark.measurePerformance(
  'Example AI',
  ai_example,
  standardGameState
);

console.log('\n>> Benchmarking Default AI...');
const defaultResult = simpleBenchmark.measurePerformance(
  'Default AI',
  ai_default,
  standardGameState
);

console.log('\n>> Benchmarking Defensive AI...');
const defensiveResult = complexBenchmark.measurePerformance(
  'Defensive AI',
  ai_defensive,
  standardGameState
);

console.log('\n>> Benchmarking Adaptive AI...');
const adaptiveResult = complexBenchmark.measurePerformance(
  'Adaptive AI',
  ai_adaptive,
  standardGameState
);

// Save individual results to JSON files
const saveResult = (name, result) => {
  const filename = path.join(RESULTS_DIR, `${name.replace(/\s+/g, '_').toLowerCase()}.json`);
  fs.writeFileSync(filename, JSON.stringify(result, null, 2));
  console.log(`Saved results to ${filename}`);
};

saveResult('Example AI', exampleResult);
saveResult('Default AI', defaultResult);
saveResult('Defensive AI', defensiveResult);
saveResult('Adaptive AI', adaptiveResult);

// Run comparison benchmark
console.log('\n===== Running AI Strategy Comparison =====');

const comparisonBenchmark = new AIBenchmark({
  iterations: COMPLEX_ITERATIONS, // Use the smaller count for fairness
  warmupRuns: WARMUP_RUNS,
  logResults: true
});

const comparisonResults = comparisonBenchmark.compareStrategies([
  { name: 'Example AI', function: ai_example },
  { name: 'Default AI', function: ai_default },
  { name: 'Defensive AI', function: ai_defensive },
  { name: 'Adaptive AI', function: ai_adaptive }
], standardGameState);

// Save comparison results
const comparisonFilename = path.join(RESULTS_DIR, 'comparison_results.json');
fs.writeFileSync(comparisonFilename, JSON.stringify(comparisonResults, null, 2));
console.log(`\nSaved comparison results to ${comparisonFilename}`);

// Generate HTML report
const generateHtmlReport = (results) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFilename = path.join(RESULTS_DIR, `benchmark_report_${timestamp}.html`);
  
  // Create table rows for each strategy
  const strategyRows = Object.entries(results)
    .map(([name, data]) => {
      const consistency = data.decisionConsistency;
      const mostCommon = consistency.mostCommon ? 
        `${consistency.mostCommon[0]} (${((consistency.mostCommon[1] / data.iterations) * 100).toFixed(1)}%)` : 
        'N/A';
      
      return `
        <tr>
          <td>${name}</td>
          <td>${data.iterations}</td>
          <td>${data.averageTime.toFixed(3)} ms</td>
          <td>${data.medianTime.toFixed(3)} ms</td>
          <td>${data.minTime.toFixed(3)} ms</td>
          <td>${data.maxTime.toFixed(3)} ms</td>
          <td>${consistency.uniqueDecisions}</td>
          <td>${mostCommon}</td>
        </tr>
      `;
    })
    .join('');
  
  // Create HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DiceWarsJS AI Benchmark Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        h1, h2, h3 {
          color: #2c3e50;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .chart-container {
          width: 100%;
          height: 400px;
          margin: 30px 0;
        }
        .summary {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <h1>DiceWarsJS AI Benchmark Report</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      
      <div class="summary">
        <h2>Benchmark Summary</h2>
        <p>This report compares the performance characteristics of different AI strategies in the DiceWarsJS game.</p>
        <p>Each AI was tested on the same game state for consistent comparison.</p>
      </div>
      
      <h2>Performance Comparison</h2>
      <table>
        <thead>
          <tr>
            <th>Strategy</th>
            <th>Iterations</th>
            <th>Average Time</th>
            <th>Median Time</th>
            <th>Min Time</th>
            <th>Max Time</th>
            <th>Unique Decisions</th>
            <th>Most Common Decision</th>
          </tr>
        </thead>
        <tbody>
          ${strategyRows}
        </tbody>
      </table>
      
      <h2>Performance Visualization</h2>
      <div class="chart-container">
        <canvas id="timeChart"></canvas>
      </div>
      
      <div class="chart-container">
        <canvas id="decisionsChart"></canvas>
      </div>
      
      <h2>Test Environment</h2>
      <p>Benchmark was run with the following configuration:</p>
      <ul>
        <li>Simple AI Iterations: ${ITERATIONS}</li>
        <li>Complex AI Iterations: ${COMPLEX_ITERATIONS}</li>
        <li>Warmup Runs: ${WARMUP_RUNS}</li>
        <li>Date: ${new Date().toISOString()}</li>
      </ul>
      
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script>
        // Performance chart
        const timeCtx = document.getElementById('timeChart').getContext('2d');
        new Chart(timeCtx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(Object.keys(results))},
            datasets: [{
              label: 'Average Execution Time (ms)',
              data: ${JSON.stringify(Object.values(results).map(r => r.averageTime))},
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'Median Execution Time (ms)',
              data: ${JSON.stringify(Object.values(results).map(r => r.medianTime))},
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'AI Strategy Execution Time'
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Time (ms)'
                }
              }
            }
          }
        });
        
        // Decisions chart
        const decisionsCtx = document.getElementById('decisionsChart').getContext('2d');
        new Chart(decisionsCtx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(Object.keys(results))},
            datasets: [{
              label: 'Unique Decisions',
              data: ${JSON.stringify(Object.values(results).map(r => r.decisionConsistency.uniqueDecisions))},
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'AI Decision Variety'
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Count of Unique Decisions'
                }
              }
            }
          }
        });
      </script>
    </body>
    </html>
  `;
  
  fs.writeFileSync(reportFilename, htmlContent);
  console.log(`\nGenerated HTML report: ${reportFilename}`);
  
  return reportFilename;
};

// Generate HTML report from comparison results
const reportFile = generateHtmlReport(comparisonResults);

console.log('\n===== Benchmark Complete =====');
console.log(`\nResults have been saved to: ${RESULTS_DIR}`);
console.log(`HTML Report: ${reportFile}`);