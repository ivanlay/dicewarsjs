/**
 * Tests for Configuration Management Module
 */
/*
 * Mock the AI module first
 * Now import the module under test
 */
import {
  DEFAULT_CONFIG,
  getConfig,
  updateConfig,
  resetConfig,
  applyConfigToGame,
} from '../../src/utils/config.js';

jest.mock('../../src/ai/index.js', () => {
  const mockDefaultAI = jest.fn();
  const mockDefensiveAI = jest.fn();
  const mockExampleAI = jest.fn();
  const mockAdaptiveAI = jest.fn();

  return {
    AI_STRATEGIES: {
      ai_default: { implementation: mockDefaultAI },
      ai_defensive: { implementation: mockDefensiveAI },
      ai_example: { implementation: mockExampleAI },
      ai_adaptive: { implementation: mockAdaptiveAI },
    },
    createAIFunctionMapping: jest.fn(aiAssignments => {
      const mapping = Array(8).fill(null);

      if (!aiAssignments) return mapping;

      aiAssignments.forEach((type, index) => {
        if (type === 'ai_default') mapping[index] = mockDefaultAI;
        else if (type === 'ai_defensive') mapping[index] = mockDefensiveAI;
        else if (type === 'ai_example') mapping[index] = mockExampleAI;
        else if (type === 'ai_adaptive') mapping[index] = mockAdaptiveAI;
        else if (type !== null) mapping[index] = mockDefaultAI; // Fallback
      });

      return mapping;
    }),
    ai_default: mockDefaultAI,
    ai_defensive: mockDefensiveAI,
    ai_example: mockExampleAI,
    ai_adaptive: mockAdaptiveAI,
    DEFAULT_AI_ASSIGNMENTS: Array(8).fill('ai_default'),
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Configuration Management', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('DEFAULT_CONFIG', () => {
    test('has the expected default values', () => {
      expect(DEFAULT_CONFIG.playerCount).toBe(7);
      expect(DEFAULT_CONFIG.humanPlayerIndex).toBe(0);
      expect(DEFAULT_CONFIG.averageDicePerArea).toBe(3);
      expect(DEFAULT_CONFIG.aiAssignments).toHaveLength(8);
      expect(DEFAULT_CONFIG.display).toBeDefined();
    });
  });

  describe('getConfig', () => {
    test('returns a copy of the active config', () => {
      const config = getConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
      expect(config).not.toBe(DEFAULT_CONFIG); // Should be a different object (copy)
    });
  });

  describe('updateConfig', () => {
    test('updates existing config values', () => {
      const newConfig = {
        playerCount: 4,
        humanPlayerIndex: 2,
      };

      updateConfig(newConfig);
      const updatedConfig = getConfig();

      expect(updatedConfig.playerCount).toBe(4);
      expect(updatedConfig.humanPlayerIndex).toBe(2);
      expect(updatedConfig.averageDicePerArea).toBe(DEFAULT_CONFIG.averageDicePerArea);
    });

    test('updates nested display object', () => {
      const newConfig = {
        display: {
          viewWidth: 1024,
          viewHeight: 768,
        },
      };

      updateConfig(newConfig);
      const updatedConfig = getConfig();

      expect(updatedConfig.display.viewWidth).toBe(1024);
      expect(updatedConfig.display.viewHeight).toBe(768);
      expect(updatedConfig.display.cellWidth).toBe(DEFAULT_CONFIG.display.cellWidth);
    });

    test('saves to localStorage if available', () => {
      const newConfig = { playerCount: 4 };
      updateConfig(newConfig);

      expect(localStorage.setItem).toHaveBeenCalled();
      expect(localStorage.setItem.mock.calls[0][0]).toBe('dicewarsConfig');
      expect(JSON.parse(localStorage.setItem.mock.calls[0][1])).toMatchObject(newConfig);
    });
  });

  describe('resetConfig', () => {
    test('resets config to default values', () => {
      updateConfig({ playerCount: 4 });
      expect(getConfig().playerCount).toBe(4);

      resetConfig();
      expect(getConfig()).toEqual(DEFAULT_CONFIG);
    });

    test('removes config from localStorage', () => {
      updateConfig({ playerCount: 4 });
      resetConfig();

      expect(localStorage.removeItem).toHaveBeenCalledWith('dicewarsConfig');
    });
  });

  describe('applyConfigToGame', () => {
    test('applies config values to game object', () => {
      // Mock AI functions for testing
      const mockDefaultAI = jest.fn();
      const mockDefensiveAI = jest.fn();
      const mockExampleAI = jest.fn();
      const mockAdaptiveAI = jest.fn();

      // Our mocks are already set up at the top of the file

      const game = {
        pmax: 0,
        user: 0,
        put_dice: 0,
        XMAX: 0,
        YMAX: 0,
        AREA_MAX: 0,
        ai: [null, null, null, null, null, null, null, null],
        aiRegistry: {
          ai_default: mockDefaultAI,
          ai_defensive: mockDefensiveAI,
          ai_example: mockExampleAI,
          ai_adaptive: mockAdaptiveAI,
        },
        configureAI: jest.fn(function (aiAssignments) {
          // Simple implementation to simulate the configureAI function
          for (let i = 0; i < aiAssignments.length && i < this.ai.length; i++) {
            if (aiAssignments[i] === 'ai_default') this.ai[i] = this.aiRegistry.ai_default;
            else if (aiAssignments[i] === 'ai_defensive') this.ai[i] = this.aiRegistry.ai_defensive;
            else if (aiAssignments[i] === 'ai_example') this.ai[i] = this.aiRegistry.ai_example;
            else if (aiAssignments[i] === 'ai_adaptive') this.ai[i] = this.aiRegistry.ai_adaptive;
            else if (aiAssignments[i] !== null) this.ai[i] = this.aiRegistry.ai_default;
          }

          return this;
        }),
      };

      const config = {
        playerCount: 5,
        humanPlayerIndex: 2,
        averageDicePerArea: 4,
        mapWidth: 30,
        mapHeight: 34,
        territoriesCount: 36,
        aiAssignments: [
          null,
          'ai_adaptive',
          'ai_defensive',
          'ai_example',
          'ai_default',
          null,
          null,
          null,
        ],
      };

      applyConfigToGame(game, config);

      expect(game.pmax).toBe(5);
      expect(game.user).toBe(2);
      expect(game.put_dice).toBe(4);
      expect(game.XMAX).toBe(30);
      expect(game.YMAX).toBe(34);
      expect(game.AREA_MAX).toBe(36);

      /*
       * For the purposes of this test, we only check if configureAI was called
       * since the actual AI assignment happens in that function
       */
      expect(game.configureAI).toHaveBeenCalled();
    });

    test('handles unknown AI types gracefully', () => {
      // Create mock function
      const mockDefaultAI = jest.fn();

      const game = {
        ai: [null, null],
        aiRegistry: {
          ai_default: mockDefaultAI,
        },
        configureAI: jest.fn(function (aiAssignments) {
          // Simple implementation to simulate the configureAI function
          for (let i = 0; i < aiAssignments.length && i < this.ai.length; i++) {
            if (aiAssignments[i] === null) {
              this.ai[i] = null;
            } else {
              // Default to ai_default for unknown types
              this.ai[i] = this.aiRegistry.ai_default;
            }
          }
          return this;
        }),
      };

      const config = {
        aiAssignments: [null, 'ai_unknown'],
      };

      applyConfigToGame(game, config);

      expect(game.ai[0]).toBeNull();
      expect(game.ai[1]).toBe(game.aiRegistry.ai_default);
    });
  });
});
