module.exports = {
  // Set the test environment to jsdom to simulate browser environment
  testEnvironment: 'jsdom',
  
  // Transform JS files using Babel
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  
  // Set module name mappings
  moduleNameMapper: {
    // Handle static assets
    '\\.(jpg|jpeg|png|gif|wav|mp3|svg)$': '<rootDir>/tests/mocks/fileMock.js',
    // Handle stylesheets
    '\\.(css|less|scss)$': '<rootDir>/tests/mocks/styleMock.js',
  },
  
  // Specify where to find test files
  testMatch: [
    '**/tests/**/*.test.js',
    '**/src/**/*.test.js',
    '**/tests/benchmarks/*.benchmark.js'
  ],
  
  // Setup files to run before tests
  setupFiles: [
    '<rootDir>/tests/setup.js'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/bridge/**/*.js', // Exclude bridge files from coverage
    '!**/node_modules/**',
  ],
  
  // Specify coverage directory
  coverageDirectory: 'coverage',
  
  // Verbosity level (0 = minimal, 1 = normal, 2 = verbose)
  verbose: true,
  
  // Enable watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};