/**
 * Tests for the process.js polyfill
 */

describe('Process Polyfill', () => {
  let originalWindow;

  beforeEach(() => {
    // Save original window object and reset modules
    originalWindow = global.window;
    jest.resetModules();

    // We need to manually delete the process from global window between tests
    if (global.window && global.window.process) {
      delete global.window.process;
    }
  });

  afterEach(() => {
    // Restore original window object
    global.window = originalWindow;
  });

  test('sets up process.env.NODE_ENV in browser environment', () => {
    // Reset window object first to ensure no process exists
    delete global.window;

    // Create a fresh mock window object without process
    global.window = {
      location: {
        hostname: 'localhost',
      },
    };

    // Load the polyfill (require fresh copy)
    jest.isolateModules(() => {
      require('../../src/polyfills/process.js');
    });

    // Verify process.env is set up correctly
    expect(window.process).toBeDefined();
    expect(window.process.env).toBeDefined();
    expect(window.process.env.NODE_ENV).toBe('development');
  });

  test('sets NODE_ENV to "development" for localhost', () => {
    // Reset window object first
    delete global.window;

    // Create a mock window object without process
    global.window = {
      location: {
        hostname: 'localhost',
      },
    };

    // Load the polyfill in isolation
    jest.isolateModules(() => {
      require('../../src/polyfills/process.js');
    });

    // Verify NODE_ENV is set to development
    expect(window.process.env.NODE_ENV).toBe('development');
  });

  test('sets NODE_ENV to "development" for 127.0.0.1', () => {
    // Reset window object first
    delete global.window;

    // Create a mock window object without process
    global.window = {
      location: {
        hostname: '127.0.0.1',
      },
    };

    // Load the polyfill in isolation
    jest.isolateModules(() => {
      require('../../src/polyfills/process.js');
    });

    // Verify NODE_ENV is set to development
    expect(window.process.env.NODE_ENV).toBe('development');
  });

  test('sets NODE_ENV to "development" for dev domains', () => {
    // Reset window object first
    delete global.window;

    // Create a mock window object without process
    global.window = {
      location: {
        hostname: 'dev.example.com',
      },
    };

    // Load the polyfill in isolation
    jest.isolateModules(() => {
      require('../../src/polyfills/process.js');
    });

    // Verify NODE_ENV is set to development
    expect(window.process.env.NODE_ENV).toBe('development');
  });

  test('sets NODE_ENV to "production" for production domains', () => {
    // Reset window object first
    delete global.window;

    // Create a mock window object without process
    global.window = {
      location: {
        hostname: 'example.com',
      },
    };

    // Load the polyfill in isolation
    jest.isolateModules(() => {
      require('../../src/polyfills/process.js');
    });

    // Verify NODE_ENV is set to production
    expect(window.process.env.NODE_ENV).toBe('production');
  });

  test('does not override existing process object', () => {
    // Reset window object first
    delete global.window;

    // Create a mock window object with existing process
    global.window = {
      location: {
        hostname: 'example.com',
      },
      process: {
        env: {
          NODE_ENV: 'test',
        },
      },
    };

    // Take a snapshot of the original process
    const originalProcess = { ...global.window.process };

    // Load the polyfill in isolation
    jest.isolateModules(() => {
      require('../../src/polyfills/process.js');
    });

    // Verify existing process object is not changed
    expect(window.process).toEqual(originalProcess);
  });

  test('does nothing in non-browser environment', () => {
    // Save any existing window
    const savedWindow = global.window;

    // Set window to undefined to simulate non-browser environment
    global.window = undefined;

    // Load the polyfill
    jest.isolateModules(() => {
      require('../../src/polyfills/process.js');
    });

    // Verify nothing breaks
    expect(global.window).toBeUndefined();

    // Restore window if it existed
    global.window = savedWindow;
  });
});
