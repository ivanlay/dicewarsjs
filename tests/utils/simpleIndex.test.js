/**
 * Simple test for utils index to increase coverage
 */
describe('Utils Index', () => {
  it('should export modules', () => {
    const utils = require('../../src/utils/index.js');
    expect(utils).toBeDefined();
    // Basic check that confirms the module exports something
    expect(Object.keys(utils).length).toBeGreaterThan(0);
  });
});
