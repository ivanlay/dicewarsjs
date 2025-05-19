import errors, {
  GameError,
  TerritoryError,
  BattleError,
  PlayerError,
  GameStateError,
} from '../../../src/mechanics/errors/index.js';

describe('Error Module Exports', () => {
  describe('named exports', () => {
    it('should export GameError', () => {
      expect(GameError).toBeDefined();
      expect(typeof GameError).toBe('function');
    });

    it('should export TerritoryError', () => {
      expect(TerritoryError).toBeDefined();
      expect(typeof TerritoryError).toBe('function');
    });

    it('should export BattleError', () => {
      expect(BattleError).toBeDefined();
      expect(typeof BattleError).toBe('function');
    });

    it('should export PlayerError', () => {
      expect(PlayerError).toBeDefined();
      expect(typeof PlayerError).toBe('function');
    });

    it('should export GameStateError', () => {
      expect(GameStateError).toBeDefined();
      expect(typeof GameStateError).toBe('function');
    });
  });

  describe('default export', () => {
    it('should have all error types in the default export', () => {
      expect(errors).toBeDefined();
      expect(errors.GameError).toBe(GameError);
      expect(errors.TerritoryError).toBe(TerritoryError);
      expect(errors.BattleError).toBe(BattleError);
      expect(errors.PlayerError).toBe(PlayerError);
      expect(errors.GameStateError).toBe(GameStateError);
    });
  });
});
