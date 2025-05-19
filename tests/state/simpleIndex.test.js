/**
 * Simple test for state index module
 */
describe('State Index Simple', () => {
  it('should export state modules', () => {
    const state = require('../../src/state/index.js');
    // Just confirm the module exports something
    expect(state).toBeDefined();
  });
});
