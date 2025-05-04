/**
 * Bridge Module Initialization Tests
 * 
 * These tests focus on the initialization behavior of bridge modules,
 * including error handling, fallbacks, and loading order.
 */

describe('Bridge Module Initialization', () => {
  beforeEach(() => {
    // Clear any previously loaded bridge modules from the global scope
    delete window.Game;
    delete window.ai_default;
    delete window.ai_defensive;
    delete window.ai_example;
    delete window.ai_adaptive;
    delete window.calculateAttackProbability;
    delete window.rollDice;
    delete window.checkBridgeStatus;
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset console spies
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore all mocks
    console.log.mockRestore();
    console.error.mockRestore();
  });
  
  describe('Game Bridge Initialization', () => {
    test('logs success message on successful initialization', () => {
      // Load the Game bridge module
      require('../../src/bridge/Game.js');
      
      // Check that success message was logged
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Game bridge module initialized successfully')
      );
    });
    
    test('provides fallback implementation when initialization fails', () => {
      // Mock window.Game to throw an error when set
      const originalDefineProperty = Object.defineProperty;
      Object.defineProperty = jest.fn().mockImplementation((obj, prop, descriptor) => {
        if (obj === window && prop === 'Game') {
          throw new Error('Mock initialization error');
        }
        return originalDefineProperty(obj, prop, descriptor);
      });
      
      // Load the bridge module, which should trigger the error
      require('../../src/bridge/Game.js');
      
      // Check that error was logged
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize Game bridge module'),
        expect.any(Error)
      );
      
      // Check that fallback implementation is provided
      expect(window.Game).toBeDefined();
      expect(typeof window.Game).toBe('function');
      
      // Create instance of fallback Game
      const fallbackGame = new window.Game();
      
      // Check it has basic properties
      expect(fallbackGame.XMAX).toBe(28);
      expect(fallbackGame.YMAX).toBe(32);
      
      // Restore original Object.defineProperty
      Object.defineProperty = originalDefineProperty;
    });
  });
  
  describe('AI Bridge Initialization', () => {
    test('logs success message on successful initialization', () => {
      // Load the AI bridge module
      require('../../src/bridge/ai.js');
      
      // Check that success message was logged
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('AI bridge module initialized successfully')
      );
    });
    
    test('provides fallback AI implementations when initialization fails', () => {
      // Mock window object to throw errors when AI functions are set
      const originalDefineProperty = Object.defineProperty;
      Object.defineProperty = jest.fn().mockImplementation((obj, prop, descriptor) => {
        if (obj === window && prop.startsWith('ai_')) {
          throw new Error('Mock initialization error');
        }
        return originalDefineProperty(obj, prop, descriptor);
      });
      
      // Load the bridge module, which should trigger the error
      require('../../src/bridge/ai.js');
      
      // Check that error was logged
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize AI bridge module'),
        expect.any(Error)
      );
      
      // Check that fallback implementations are provided
      expect(window.ai_default).toBeDefined();
      expect(window.ai_defensive).toBeDefined();
      expect(window.ai_example).toBeDefined();
      expect(window.ai_adaptive).toBeDefined();
      
      // Create a mock game for testing the fallback
      const mockGame = {
        areas: [
          { owner: 1, dice: 3 },
          { owner: 2, dice: 2 },
          { owner: 1, dice: 1 }
        ]
      };
      
      // Check that fallback functions don't throw errors
      expect(() => window.ai_default(mockGame, 1)).not.toThrow();
      expect(() => window.ai_defensive(mockGame, 1)).not.toThrow();
      expect(() => window.ai_example(mockGame, 1)).not.toThrow();
      expect(() => window.ai_adaptive(mockGame, 1)).not.toThrow();
      
      // Restore original Object.defineProperty
      Object.defineProperty = originalDefineProperty;
    });
  });
  
  describe('Bridge Index Module', () => {
    test('tracks module loading status', () => {
      // Load the bridge index module
      require('../../src/bridge/index.js');
      
      // Check that the status tracking is available
      expect(window.checkBridgeStatus).toBeDefined();
      
      // Get the status
      const status = window.checkBridgeStatus();
      
      // All modules should be marked as loaded
      expect(status.gameUtils).toBe('loaded');
      expect(status.render).toBe('loaded');
      expect(status.sound).toBe('loaded');
      expect(status.ai).toBe('loaded');
      expect(status.game).toBe('loaded');
    });
    
    test('handles errors in findModuleFromError function', () => {
      // Import module
      const indexModule = require('../../src/bridge/index.js');
      
      // Access the findModuleFromError function (assuming it's exported for testing)
      // If it's not exported, we can test indirectly through the error event handler
      
      // Create a mock error with a specific module mentioned
      const gameUtilsError = new Error('Error in gameUtils module');
      const renderError = new Error('Error in render operations');
      const soundError = { toString: () => 'Error in sound playback' }; // Non-standard error object
      const aiError = { stack: 'at ai.js:42:10' }; // Error with stack but no message
      const gameError = new Error('Game initialization failed');
      const unknownError = new Error('Some other error');
      
      // Dispatch error events to trigger the handler
      window.dispatchEvent(new ErrorEvent('error', { error: gameUtilsError }));
      window.dispatchEvent(new ErrorEvent('error', { error: renderError }));
      window.dispatchEvent(new ErrorEvent('error', { error: soundError }));
      window.dispatchEvent(new ErrorEvent('error', { error: aiError }));
      window.dispatchEvent(new ErrorEvent('error', { error: gameError }));
      window.dispatchEvent(new ErrorEvent('error', { error: unknownError }));
      
      // Check that errors were properly logged
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error in bridge module gameUtils:'),
        expect.any(Error)
      );
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error in bridge module render:'),
        expect.any(Error)
      );
      
      // Check the status reflects the errors
      const status = window.checkBridgeStatus();
      
      // Modules with errors should be marked as failed
      expect(status.gameUtils).toBe('failed');
      expect(status.render).toBe('failed');
    });
    
    test('logs initialization success message', () => {
      // Load the bridge index module
      require('../../src/bridge/index.js');
      
      // Check that success message was logged
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('ES6 utility and AI bridge modules loaded successfully')
      );
    });
  });
});