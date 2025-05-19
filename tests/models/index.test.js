/**
 * Tests for models index module
 */
describe('Models Index Module', () => {
  it('should export all model classes', () => {
    const models = require('../../src/models/index.js');

    // Test that all model classes are exported
    expect(typeof models.AreaData).toBe('function');
    expect(typeof models.PlayerData).toBe('function');
    expect(typeof models.JoinData).toBe('function');
    expect(typeof models.HistoryData).toBe('function');
    expect(typeof models.Battle).toBe('function');
  });

  it('should create instances of model classes', () => {
    const {
      AreaData,
      PlayerData,
      JoinData,
      HistoryData,
      Battle,
    } = require('../../src/models/index.js');

    // Test that we can create instances
    expect(new AreaData()).toBeDefined();
    expect(new PlayerData()).toBeDefined();
    expect(new JoinData()).toBeDefined();
    expect(new HistoryData()).toBeDefined();
    expect(new Battle()).toBeDefined();
  });
});
