/**
 * Game Event System
 *
 * Provides a centralized event handling system for game state changes.
 * Implements publisher-subscriber pattern with event types, handlers, and middleware.
 */

/**
 * Event Types Enum
 *
 * Defines all possible event types in the game to allow for strong typing.
 *
 * @readonly
 * @enum {string}
 */
export const EventType = {
  // Game lifecycle events
  GAME_START: 'game:start',
  GAME_END: 'game:end',
  TURN_START: 'turn:start',
  TURN_END: 'turn:end',

  // Player events
  PLAYER_ELIMINATED: 'player:eliminated',
  PLAYER_VICTORY: 'player:victory',

  // Territory events
  TERRITORY_ATTACK: 'territory:attack',
  TERRITORY_CAPTURE: 'territory:capture',
  TERRITORY_DEFEND: 'territory:defend',
  TERRITORY_REINFORCED: 'territory:reinforced',

  // Dice events
  DICE_ROLLED: 'dice:rolled',
  DICE_ADDED: 'dice:added',

  // UI events
  SELECTION_CHANGED: 'ui:selection_changed',
  MAP_UPDATED: 'ui:map_updated',

  // AI events
  AI_THINKING_START: 'ai:thinking_start',
  AI_THINKING_END: 'ai:thinking_end',
  AI_DECISION_MADE: 'ai:decision_made',

  // Custom event for extensions
  CUSTOM: 'custom',
};

/**
 * EventEmitter class
 *
 * Core event management system that allows subscribing to and publishing events.
 * Supports event middleware, asynchronous handling, and subscription management.
 */
class EventEmitter {
  constructor() {
    /**
     * Map of event types to arrays of handler functions
     * @type {Map<string, Array<function>>}
     */
    this.handlers = new Map();

    /**
     * Array of middleware functions that process events before handlers
     * @type {Array<function>}
     */
    this.middleware = [];

    /**
     * Map to track subscription IDs
     * @type {Map<string, Set<string>>}
     */
    this.subscriptionIds = new Map();

    /**
     * Counter for generating unique subscription IDs
     * @type {number}
     */
    this.idCounter = 0;
  }

  /**
   * Subscribe to an event type
   *
   * @param {string} eventType - Type of event to subscribe to
   * @param {function} handler - Function to call when event occurs
   * @returns {string} Subscription ID that can be used to unsubscribe
   */
  on(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
      this.subscriptionIds.set(eventType, new Set());
    }

    const handlers = this.handlers.get(eventType);
    handlers.push(handler);

    // Generate and store subscription ID
    const subscriptionId = `${eventType}_${++this.idCounter}`;
    this.subscriptionIds.get(eventType).add(subscriptionId);

    return subscriptionId;
  }

  /**
   * Subscribe to an event type and unsubscribe after first trigger
   *
   * @param {string} eventType - Type of event to subscribe to
   * @param {function} handler - Function to call when event occurs
   * @returns {string} Subscription ID that can be used to unsubscribe
   */
  once(eventType, handler) {
    const onceHandler = data => {
      // Remove this handler after execution
      this.off(subscriptionId);
      // Call the original handler
      handler(data);
    };

    const subscriptionId = this.on(eventType, onceHandler);
    return subscriptionId;
  }

  /**
   * Unsubscribe from an event using subscription ID
   *
   * @param {string} subscriptionId - ID returned by on() or once()
   * @returns {boolean} True if successfully unsubscribed
   */
  off(subscriptionId) {
    // Parse event type from subscription ID
    const [eventType] = subscriptionId.split('_');

    if (
      !this.handlers.has(eventType) ||
      !this.subscriptionIds.has(eventType) ||
      !this.subscriptionIds.get(eventType).has(subscriptionId)
    ) {
      return false;
    }

    // Find the index of the handler
    const handlerIndex = parseInt(subscriptionId.split('_')[1], 10) - 1;
    if (handlerIndex < 0 || handlerIndex >= this.handlers.get(eventType).length) {
      return false;
    }

    // Remove the handler
    const handlers = this.handlers.get(eventType);
    handlers.splice(handlerIndex, 1);

    // Remove the subscription ID
    this.subscriptionIds.get(eventType).delete(subscriptionId);

    return true;
  }

  /**
   * Unsubscribe all handlers for a specific event type
   *
   * @param {string} eventType - Type of event to unsubscribe from
   */
  offAll(eventType) {
    if (this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
      this.subscriptionIds.set(eventType, new Set());
    }
  }

  /**
   * Add middleware function to process events before handlers
   *
   * @param {function} middlewareFn - Function(eventType, data) that can transform event data
   * @returns {function} Function to remove this middleware
   */
  addMiddleware(middlewareFn) {
    this.middleware.push(middlewareFn);

    // Return function to remove this middleware
    return () => {
      const index = this.middleware.indexOf(middlewareFn);
      if (index !== -1) {
        this.middleware.splice(index, 1);
      }
    };
  }

  /**
   * Emit an event to all subscribers, passing through middleware
   *
   * @param {string} eventType - Type of event to emit
   * @param {Object} data - Data to pass to handlers
   * @returns {Promise<Array>} Promise resolving to array of handler results
   */
  async emit(eventType, data = {}) {
    // If no handlers, return immediately
    if (!this.handlers.has(eventType) || this.handlers.get(eventType).length === 0) {
      return [];
    }

    // Process event through middleware
    let processedData = { ...data };
    for (const middleware of this.middleware) {
      processedData = (await middleware(eventType, processedData)) || processedData;
    }

    // Call all handlers with processed data
    const handlers = this.handlers.get(eventType);
    const results = await Promise.all(
      handlers.map(handler => {
        try {
          return Promise.resolve(handler(processedData));
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
          return Promise.resolve(null);
        }
      })
    );

    return results;
  }

  /**
   * Check if an event type has any subscribers
   *
   * @param {string} eventType - Type of event to check
   * @returns {boolean} True if event has subscribers
   */
  hasSubscribers(eventType) {
    return this.handlers.has(eventType) && this.handlers.get(eventType).length > 0;
  }

  /**
   * Get count of subscribers for an event type
   *
   * @param {string} eventType - Type of event to check
   * @returns {number} Number of subscribers
   */
  subscriberCount(eventType) {
    return this.handlers.has(eventType) ? this.handlers.get(eventType).length : 0;
  }
}

// Create singleton instance
export const gameEvents = new EventEmitter();

/**
 * Event payloads for different event types
 */

/**
 * @typedef {Object} TerritoryAttackEvent
 * @property {number} attackerId - ID of the attacking territory
 * @property {number} defenderId - ID of the defending territory
 * @property {number} attackerPlayerId - ID of attacking player
 * @property {number} defenderPlayerId - ID of defending player
 * @property {number} attackerDice - Number of dice in attacking territory
 * @property {number} defenderDice - Number of dice in defending territory
 */

/**
 * @typedef {Object} DiceRolledEvent
 * @property {number} territoryId - ID of the territory
 * @property {number} playerId - ID of the territory owner
 * @property {Array<number>} values - Dice roll values
 * @property {number} total - Total of dice rolls
 * @property {string} context - Context of roll (e.g., "attack", "defend")
 */

/**
 * @typedef {Object} TerritoryCaptureEvent
 * @property {number} territoryId - ID of the captured territory
 * @property {number} capturedFromPlayerId - ID of player who lost the territory
 * @property {number} capturedByPlayerId - ID of player who captured the territory
 * @property {number} remainingDice - Number of dice in territory after capture
 */

/**
 * Helper function to get standardized territory data for events
 *
 * @param {Object} gameState - Current game state
 * @param {number} territoryId - ID of territory to get data for
 * @returns {Object} Standardized territory data
 */
export const getTerritoryEventData = (gameState, territoryId) => {
  const { adat } = gameState;
  const territory = adat[territoryId];

  return {
    territoryId,
    playerId: territory.arm,
    dice: territory.dice,
    size: territory.size,
    position: {
      x: territory.cx,
      y: territory.cy,
    },
  };
};

/**
 * Helper function to emit territory attack event
 *
 * @param {Object} gameState - Current game state
 * @param {number} attackerId - ID of attacking territory
 * @param {number} defenderId - ID of defending territory
 * @returns {Promise<Array>} Promise resolving to array of handler results
 */
export const emitTerritoryAttack = async (gameState, attackerId, defenderId) => {
  const { adat } = gameState;

  const eventData = {
    attackerId,
    defenderId,
    attackerPlayerId: adat[attackerId].arm,
    defenderPlayerId: adat[defenderId].arm,
    attackerDice: adat[attackerId].dice,
    defenderDice: adat[defenderId].dice,
    gameState,
  };

  return gameEvents.emit(EventType.TERRITORY_ATTACK, eventData);
};

/**
 * Helper function to emit territory capture event
 *
 * @param {Object} gameState - Current game state
 * @param {number} territoryId - ID of captured territory
 * @param {number} fromPlayerId - Player who lost the territory
 * @param {number} toPlayerId - Player who captured the territory
 * @returns {Promise<Array>} Promise resolving to array of handler results
 */
export const emitTerritoryCapture = async (gameState, territoryId, fromPlayerId, toPlayerId) => {
  const { adat } = gameState;

  const eventData = {
    territoryId,
    capturedFromPlayerId: fromPlayerId,
    capturedByPlayerId: toPlayerId,
    remainingDice: adat[territoryId].dice,
    gameState,
  };

  return gameEvents.emit(EventType.TERRITORY_CAPTURE, eventData);
};

/**
 * Helper function to emit dice rolled event
 *
 * @param {Object} gameState - Current game state
 * @param {number} territoryId - ID of territory where dice were rolled
 * @param {Array<number>} values - Dice roll values
 * @param {number} total - Total of dice rolls
 * @param {string} context - Context of roll (e.g., "attack", "defend")
 * @returns {Promise<Array>} Promise resolving to array of handler results
 */
export const emitDiceRolled = async (gameState, territoryId, values, total, context) => {
  const { adat } = gameState;

  const eventData = {
    territoryId,
    playerId: adat[territoryId].arm,
    values,
    total,
    context,
    gameState,
  };

  return gameEvents.emit(EventType.DICE_ROLLED, eventData);
};

/**
 * Helper function to emit territory reinforced event
 *
 * @param {Object} gameState - Current game state
 * @param {number} territoryId - ID of reinforced territory
 * @param {number} addedDice - Number of dice added
 * @returns {Promise<Array>} Promise resolving to array of handler results
 */
export const emitTerritoryReinforced = async (gameState, territoryId, addedDice) => {
  const { adat } = gameState;

  const eventData = {
    territoryId,
    playerId: adat[territoryId].arm,
    addedDice,
    totalDice: adat[territoryId].dice,
    gameState,
  };

  return gameEvents.emit(EventType.TERRITORY_REINFORCED, eventData);
};

/**
 * Logging middleware that logs all events to console
 * Can be enabled in development/debugging mode
 *
 * @param {string} eventType - Type of event
 * @param {Object} data - Event data
 * @returns {Object} The unchanged event data
 */
export const loggingMiddleware = (eventType, data) => {
  console.log(`[EVENT] ${eventType}`, data);
  return data;
};

/**
 * Debug time-traveling middleware that records all events for replay
 *
 * @returns {Object} Middleware functions and recorded events
 */
export const createTimeTravel = () => {
  const eventHistory = [];

  const recordingMiddleware = (eventType, data) => {
    eventHistory.push({
      timestamp: Date.now(),
      eventType,
      data: JSON.parse(JSON.stringify(data)),
    });
    return data;
  };

  const getHistory = () => [...eventHistory];

  const clearHistory = () => {
    eventHistory.length = 0;
  };

  return {
    middleware: recordingMiddleware,
    getHistory,
    clearHistory,
  };
};

// Export default singleton
export default gameEvents;
