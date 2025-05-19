/**
 * Browser polyfill for process.env
 * Provides a simple implementation that determines environment based on hostname
 */
if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: {
      NODE_ENV:
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('dev.')
          ? 'development'
          : 'production',
    },
  };
}
