/**
 * Tests for enhanced models index module
 */
describe('Enhanced Models Index Module', () => {
  it('should export all enhanced model classes', () => {
    const enhanced = require('../../../src/models/enhanced/index.js');

    // Test that all enhanced model classes are exported
    expect(typeof enhanced.AreaData).toBe('function');
    expect(typeof enhanced.PlayerData).toBe('function');
    expect(typeof enhanced.GridData).toBe('function');
    expect(typeof enhanced.AdjacencyGraph).toBe('function');
    expect(typeof enhanced.DisjointSet).toBe('function');
    expect(typeof enhanced.TerritoryGraph).toBe('function');
  });
});
