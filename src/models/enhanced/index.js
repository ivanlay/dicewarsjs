/**
 * Enhanced Models Index
 *
 * This file exports all enhanced game model classes that use modern ES6+ data structures
 * like Map objects and typed arrays for better performance and more idiomatic JavaScript.
 */

// Re-export other models from main directory as they have not been enhanced yet
import { JoinData } from '../JoinData.js';
import { HistoryData } from '../HistoryData.js';
import { Battle } from '../Battle.js';

export { AreaData } from './AreaData.js';
export { GridData } from './GridData.js';
export { PlayerData } from './PlayerData.js';
export { AdjacencyGraph } from './AdjacencyGraph.js';
export { DisjointSet } from './DisjointSet.js';
export { TerritoryGraph } from './TerritoryGraph.js';

export { JoinData, HistoryData, Battle };
