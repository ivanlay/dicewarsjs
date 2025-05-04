/**
 * Immutable Utilities
 *
 * This module provides helper functions for working with immutable data structures.
 * It focuses on providing a clean API for common immutable operations without
 * requiring external dependencies like Immutable.js or Immer.
 */

/**
 * Creates a shallow immutable copy of an object with updated properties
 *
 * @param {Object} obj - Original object
 * @param {Object} updates - Properties to update
 * @returns {Object} New object with updates applied
 */
export const updateObject = (obj, updates) => {
  return Object.freeze({ ...obj, ...updates });
};

/**
 * Creates a new array with updated item at specified index
 *
 * @param {Array} array - Original array
 * @param {number} index - Index to update
 * @param {*} item - New item value
 * @returns {Array} New array with the item updated
 */
export const updateArrayItem = (array, index, item) => {
  return Object.freeze([...array.slice(0, index), item, ...array.slice(index + 1)]);
};

/**
 * Creates a new array with an item added at the end
 *
 * @param {Array} array - Original array
 * @param {*} item - Item to add
 * @returns {Array} New array with item added
 */
export const addArrayItem = (array, item) => {
  return Object.freeze([...array, item]);
};

/**
 * Creates a new array with an item removed at specified index
 *
 * @param {Array} array - Original array
 * @param {number} index - Index to remove
 * @returns {Array} New array with item removed
 */
export const removeArrayItem = (array, index) => {
  return Object.freeze([...array.slice(0, index), ...array.slice(index + 1)]);
};

/**
 * Creates a new array by filtering out items
 *
 * @param {Array} array - Original array
 * @param {Function} predicate - Function that returns true for items to keep
 * @returns {Array} New filtered array
 */
export const filterArray = (array, predicate) => {
  return Object.freeze(array.filter(predicate));
};

/**
 * Creates a new array by mapping items
 *
 * @param {Array} array - Original array
 * @param {Function} mapper - Function to transform each item
 * @returns {Array} New mapped array
 */
export const mapArray = (array, mapper) => {
  return Object.freeze(array.map(mapper));
};

/**
 * Creates a new Map with updated entry
 *
 * @param {Map} map - Original Map
 * @param {*} key - Key to update
 * @param {*} value - New value
 * @returns {Map} New Map with updated entry
 */
export const updateMap = (map, key, value) => {
  const newMap = new Map(map);
  newMap.set(key, value);
  return newMap;
};

/**
 * Creates a new Map with deleted entry
 *
 * @param {Map} map - Original Map
 * @param {*} key - Key to delete
 * @returns {Map} New Map with entry removed
 */
export const deleteMapEntry = (map, key) => {
  const newMap = new Map(map);
  newMap.delete(key);
  return newMap;
};

/**
 * Creates a new Set with added item
 *
 * @param {Set} set - Original Set
 * @param {*} item - Item to add
 * @returns {Set} New Set with item added
 */
export const addSetItem = (set, item) => {
  const newSet = new Set(set);
  newSet.add(item);
  return newSet;
};

/**
 * Creates a new Set with deleted item
 *
 * @param {Set} set - Original Set
 * @param {*} item - Item to delete
 * @returns {Set} New Set with item removed
 */
export const deleteSetItem = (set, item) => {
  const newSet = new Set(set);
  newSet.delete(item);
  return newSet;
};

/**
 * Deep freezes an object and all its properties recursively
 * This makes the object and its nested properties immutable
 *
 * @param {Object} obj - Object to freeze
 * @returns {Object} Frozen object
 */
export const deepFreeze = obj => {
  // Get property names of the object
  const propNames = Object.getOwnPropertyNames(obj);

  // Freeze properties before freezing parent
  for (const name of propNames) {
    const value = obj[name];

    // Skip null/undefined values
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }

  return Object.freeze(obj);
};

/**
 * Creates a deep immutable copy of an object
 *
 * @param {Object} obj - Object to make immutable
 * @returns {Object} Deep immutable copy of the object
 */
export const immutable = obj => {
  // Handle null/undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle primitive values
  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return Object.freeze(obj.map(item => immutable(item)));
  }

  // Handle Maps
  if (obj instanceof Map) {
    const newMap = new Map();
    for (const [key, value] of obj.entries()) {
      newMap.set(key, immutable(value));
    }
    return newMap;
  }

  // Handle Sets
  if (obj instanceof Set) {
    const newSet = new Set();
    for (const item of obj) {
      newSet.add(immutable(item));
    }
    return newSet;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // Handle regular objects
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = immutable(value);
  }

  return Object.freeze(result);
};

/**
 * Produces an immutable version of a value only in development mode
 * In production, it returns the original value for better performance
 *
 * @param {*} value - Value to make immutable in development
 * @returns {*} Immutable version in development, original in production
 */
export const devImmutable = value => {
  if (process.env.NODE_ENV === 'development') {
    return immutable(value);
  }
  return value;
};
