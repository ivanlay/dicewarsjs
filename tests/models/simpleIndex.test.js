/**
 * Simple test for models index module
 */
describe('Models Index Simple', () => {
  it('should export models', () => {
    const models = require('../../src/models/index.js');
    // Just confirm the module exports something
    expect(models).toBeDefined();
  });
});
