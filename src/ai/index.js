/**
 * AI index file - exports all AI strategy functions and configuration
 */
export * from './aiConfig.js';

/**
 * Re-export loader functions instead of direct implementations
 * Direct implementations are now loaded dynamically to optimize bundle size
 * Use getAIImplementation() or the loader functions to access implementations
 */
