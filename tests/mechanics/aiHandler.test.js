/**
 * Tests for AI Handler Module
 */

import {
  AI_REGISTRY,
  generatePossibleMoves,
  executeAIMove,
  configureAI,
} from '../../src/mechanics/aiHandler.js';

import { AI_STRATEGIES } from '../../src/ai/index.js';

// Mock modules
jest.mock('../../src/ai/index.js', () => ({
  AI_STRATEGIES: {
    DEFAULT: { implementation: jest.fn().mockReturnValue(0) },
    DEFENSIVE: { implementation: jest.fn().mockReturnValue(0) },
    EXAMPLE: { implementation: jest.fn().mockReturnValue(0) },
    CUSTOM: { implementation: jest.fn().mockReturnValue(0) },
  },
  getAIImplementation: jest.fn(),
  createAIFunctionMapping: jest.fn().mockReturnValue([]),
}));

// Mock executeAttack from battleResolution
jest.mock('../../src/mechanics/battleResolution.js', () => ({
  executeAttack: jest.fn().mockReturnValue({
    success: true,
    gameState: {},
    attackSuccessful: true,
  }),
}));

describe('AI Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AI_REGISTRY', () => {
    it('should create registry from AI_STRATEGIES', () => {
      // AI_REGISTRY should map strategy names to implementations
      expect(AI_REGISTRY).toBeDefined();
      expect(typeof AI_REGISTRY).toBe('object');
      expect(AI_REGISTRY.DEFAULT).toBe(AI_STRATEGIES.DEFAULT.implementation);
      expect(AI_REGISTRY.DEFENSIVE).toBe(AI_STRATEGIES.DEFENSIVE.implementation);
    });
  });

  describe('generatePossibleMoves', () => {
    it('should generate all valid attack moves for a player', () => {
      const gameState = {
        adat: [
          null, // Index 0 unused
          { arm: 1, dice: 3, size: 5, join: [0, 0, 1, 0, 0, 1] }, // Can attack 2 and 5
          { arm: 2, dice: 2, size: 4, join: [0, 1, 0, 0, 0] }, // Enemy territory
          { arm: 1, dice: 1, size: 3, join: [0, 0, 0, 0, 0] }, // Can't attack (only 1 die)
          { arm: 1, dice: 4, size: 6, join: [0, 0, 0, 0, 1] }, // Can attack 5
          { arm: 2, dice: 1, size: 2, join: [0, 1, 0, 1, 0] }, // Enemy territory
          { arm: 0, size: 0, join: [0, 0, 0, 0, 0] }, // Non-existent
        ],
        AREA_MAX: 7,
      };

      const moves = generatePossibleMoves(gameState, 1);

      expect(moves).toHaveLength(3); // Territory 1->2, 1->5, 4->5
      expect(moves).toContainEqual({
        from: 1,
        to: 2,
        attackerDice: 3,
        defenderDice: 2,
        ratio: 1.5,
      });
      expect(moves).toContainEqual({
        from: 1,
        to: 5,
        attackerDice: 3,
        defenderDice: 1,
        ratio: 3,
      });
      expect(moves).toContainEqual({
        from: 4,
        to: 5,
        attackerDice: 4,
        defenderDice: 1,
        ratio: 4,
      });
    });

    it('should return empty array when no valid moves', () => {
      const gameState = {
        adat: [
          null,
          { arm: 1, dice: 1, size: 5, join: [0, 0, 0, 0, 0] }, // Only 1 die
          { arm: 2, dice: 3, size: 4, join: [0, 0, 0, 0, 0] }, // Enemy but not adjacent
        ],
        AREA_MAX: 3,
      };

      const moves = generatePossibleMoves(gameState, 1);

      expect(moves).toHaveLength(0);
    });

    it('should not attack own territories', () => {
      const gameState = {
        adat: [
          null,
          { arm: 1, dice: 3, size: 5, join: [0, 0, 1, 0, 0] },
          { arm: 1, dice: 2, size: 4, join: [0, 1, 0, 0, 0] }, // Same player
        ],
        AREA_MAX: 3,
      };

      const moves = generatePossibleMoves(gameState, 1);

      expect(moves).toHaveLength(0);
    });

    it('should handle adjacent territories correctly', () => {
      const gameState = {
        adat: [
          null,
          { arm: 1, dice: 3, size: 5, join: [0, 0, 1, 1, 0] }, // Adjacent to 2 and 3
          { arm: 2, dice: 2, size: 4, join: [0, 1, 0, 0, 0] }, // Enemy
          { arm: 2, dice: 1, size: 3, join: [0, 1, 0, 0, 0] }, // Enemy
          { arm: 2, dice: 1, size: 2, join: [0, 0, 0, 0, 0] }, // Not adjacent
        ],
        AREA_MAX: 5,
      };

      const moves = generatePossibleMoves(gameState, 1);

      expect(moves).toHaveLength(2);
      expect(moves.map(m => m.to)).toContain(2);
      expect(moves.map(m => m.to)).toContain(3);
      expect(moves.map(m => m.to)).not.toContain(4);
    });
  });

  describe('executeAIMove', () => {
    it('should execute AI function for current player', () => {
      const mockAI = jest.fn().mockReturnValue(1);
      const gameState = {
        ban: 0,
        jun: [1, 2],
        ai: [null, mockAI, jest.fn()],
      };

      const result = executeAIMove(gameState);

      expect(mockAI).toHaveBeenCalledWith(gameState);
      expect(result).toBe(1);
    });

    it('should handle missing AI function', () => {
      const gameState = {
        ban: 0,
        jun: [1, 2],
        ai: [null, null, jest.fn()],
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = executeAIMove(gameState);

      expect(consoleErrorSpy).toHaveBeenCalledWith('AI function not found for player 1');
      expect(result).toBe(0);

      consoleErrorSpy.mockRestore();
    });

    it('should use fallback AI when available', () => {
      const mockFallback = jest.fn().mockReturnValue(2);
      require('../../src/ai/index.js').getAIImplementation.mockReturnValue(mockFallback);

      const gameState = {
        ban: 0,
        jun: [1, 2],
        ai: [null, 'notAFunction', jest.fn()],
      };

      const result = executeAIMove(gameState);

      expect(result).toBe(2);
      expect(mockFallback).toHaveBeenCalledWith(gameState);
    });

    it('should handle AI errors gracefully', () => {
      const mockAI = jest.fn().mockImplementation(() => {
        throw new Error('AI Error');
      });

      const gameState = {
        ban: 0,
        jun: [1, 2],
        ai: [null, mockAI, jest.fn()],
      };

      expect(() => executeAIMove(gameState)).toThrow('AI Error');
    });
  });

  describe('configureAI', () => {
    it('should configure AI with assignments', () => {
      const mockMapping = [null, jest.fn(), jest.fn(), jest.fn()];
      require('../../src/ai/index.js').createAIFunctionMapping.mockReturnValue(mockMapping);

      const gameState = {
        ai: new Array(8),
      };

      const aiAssignments = ['DEFAULT', 'DEFENSIVE', 'EXAMPLE'];

      const result = configureAI(gameState, aiAssignments);

      expect(require('../../src/ai/index.js').createAIFunctionMapping).toHaveBeenCalledWith(
        aiAssignments
      );
      expect(result.ai[0]).toBe(null);
      expect(result.ai[1]).toBe(mockMapping[1]);
      expect(result.ai[2]).toBe(mockMapping[2]);
    });

    it('should return original state if no assignments', () => {
      const gameState = {
        ai: new Array(8),
      };

      const result = configureAI(gameState);

      expect(result).toEqual(gameState);
    });

    it('should handle non-array assignments', () => {
      const gameState = {
        ai: new Array(8),
      };

      const result = configureAI(gameState, 'invalid');

      expect(result).toEqual(gameState);
    });

    it('should not mutate original game state', () => {
      const mockMapping = [null, jest.fn()];
      require('../../src/ai/index.js').createAIFunctionMapping.mockReturnValue(mockMapping);

      const gameState = {
        ai: [null, null],
      };

      const original = { ...gameState };
      const result = configureAI(gameState, ['DEFAULT']);

      expect(gameState).toEqual(original);
      expect(result).not.toBe(gameState);
    });
  });
});
