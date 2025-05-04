/**
 * GameState - Immutable State Manager for DiceWars
 *
 * This module implements a state management system for the game using immutable
 * data patterns. It provides a central store for game state with controlled updates
 * to ensure data consistency and prevent unintended side effects.
 *
 * Key benefits:
 * - Predictable state updates
 * - Simplified debugging (state history)
 * - Enhanced testability
 * - Better concurrency management
 * - Safer AI operations
 */

import { deepFreeze, updateObject, updateMap } from './ImmutableUtils.js';
import { TerritoryState } from './TerritoryState.js';
import { PlayerState } from './PlayerState.js';

/**
 * Creates initial game state
 *
 * @param {Object} config - Game configuration
 * @returns {Object} Initial immutable game state
 */
export const createInitialState = (config = {}) => {
  const {
    playerCount = 7,
    humanPlayerIndex = 0,
    averageDicePerArea = 3,
    mapWidth = 28,
    mapHeight = 32,
    territoriesCount = 32,
    aiTypes = null,
  } = config;

  const initialState = {
    // Game settings
    config: {
      playerCount,
      humanPlayerIndex,
      averageDicePerArea,
      mapWidth,
      mapHeight,
      territoriesCount,
      aiTypes,
    },

    // Board state
    grid: {
      width: mapWidth,
      height: mapHeight,
      cells: Array(mapWidth * mapHeight).fill(0),
      cellFlags: Array(mapWidth * mapHeight).fill(0),
    },

    // Territory state (empty initially, populated during map generation)
    territories: new Map(),

    // Player state
    players: Array(8)
      .fill()
      .map((_, i) => createPlayerState(i)),

    // Turn state
    currentTurn: {
      playerOrder: [0, 1, 2, 3, 4, 5, 6, 7], // Initial turn order, will be randomized
      currentPlayerIndex: 0, // Index into playerOrder
      turnPhase: 'initializing', // 'initializing', 'mapGeneration', 'playerTurn', 'gameOver'
      selectedTerritory: null, // Currently selected territory (for attacks)
      targetTerritory: null, // Target territory (for attacks)
      lastAttackResult: null, // Result of the last attack
      attackCount: 0, // Number of attacks in the current turn
    },

    // History state for replays
    history: [],

    // Debug state
    debug: {
      enabled: false,
      lastAction: null,
      stateVersion: 1,
    },
  };

  return deepFreeze(initialState);
};

/**
 * Create an initial player state
 *
 * @param {number} playerIndex - Player index
 * @returns {Object} Initial player state
 */
const createPlayerState = playerIndex => {
  return {
    id: playerIndex,
    isHuman: false, // Set during initialization
    isActive: playerIndex < 7, // Default to 7 active players
    territoryCount: 0,
    diceCount: 0,
    reserveDice: 0, // Reinforcements
    largestTerritorySize: 0,
    eliminated: false,
    color: playerIndex, // Maps to color index
  };
};

/**
 * GameState Manager Class
 *
 * Manages the immutable game state and provides methods for updating it.
 */
export class GameState {
  /**
   * Create a new GameState manager
   *
   * @param {Object} initialState - Initial game state (optional)
   */
  constructor(initialState) {
    this._state = initialState || createInitialState();
    this._listeners = new Set();
    this._history = [];

    // Maximum number of state history entries to keep (for undo/debug)
    this._maxHistoryLength = 100;
  }

  /**
   * Get current state (immutable)
   *
   * @returns {Object} Current game state
   */
  getState() {
    return this._state;
  }

  /**
   * Update state with new values
   *
   * @param {Object} updates - State updates to apply
   * @param {string} actionType - Type of action for debugging
   * @returns {Object} New state after updates
   */
  updateState(updates, actionType = 'update') {
    // Store previous state in history
    this._addToHistory(this._state, actionType);

    // Create new state by merging updates with current state
    const newState = updateObject(this._state, updates);

    // Update debug information
    const newDebug = updateObject(newState.debug, {
      lastAction: actionType,
      stateVersion: newState.debug.stateVersion + 1,
    });

    // Set the new state with updated debug info
    this._state = updateObject(newState, { debug: newDebug });

    // Notify listeners
    this._notifyListeners();

    return this._state;
  }

  /**
   * Update a territory in the state
   *
   * @param {number} territoryId - ID of the territory to update
   * @param {Object} updates - Updates to apply to the territory
   * @param {string} actionType - Type of action for debugging
   * @returns {Object} New state after updates
   */
  updateTerritory(territoryId, updates, actionType = 'updateTerritory') {
    const territories = this._state.territories;
    const territory = territories.get(territoryId);

    if (!territory) {
      console.warn(`Attempted to update non-existent territory: ${territoryId}`);
      return this._state;
    }

    // Create updated territory
    const updatedTerritory = TerritoryState.update(territory, updates);

    // Create new territories map
    const newTerritories = updateMap(territories, territoryId, updatedTerritory);

    // Update state with new territories map
    return this.updateState({ territories: newTerritories }, actionType);
  }

  /**
   * Update a player in the state
   *
   * @param {number} playerIndex - Index of the player to update
   * @param {Object} updates - Updates to apply to the player
   * @param {string} actionType - Type of action for debugging
   * @returns {Object} New state after updates
   */
  updatePlayer(playerIndex, updates, actionType = 'updatePlayer') {
    if (playerIndex < 0 || playerIndex >= this._state.players.length) {
      console.warn(`Attempted to update non-existent player: ${playerIndex}`);
      return this._state;
    }

    const players = [...this._state.players];
    const player = players[playerIndex];

    // Create updated player using PlayerState helper
    const updatedPlayer = PlayerState.update(player, updates);

    // Create new players array
    players[playerIndex] = updatedPlayer;

    // Update state with new players array
    return this.updateState({ players: Object.freeze(players) }, actionType);
  }

  /**
   * Add an action to the game history
   *
   * @param {Object} action - History action to add
   * @returns {Object} New state after updates
   */
  addHistoryAction(action) {
    const newHistory = [...this._state.history, action];
    return this.updateState({ history: Object.freeze(newHistory) }, 'addHistory');
  }

  /**
   * Update turn state
   *
   * @param {Object} updates - Updates to apply to turn state
   * @returns {Object} New state after updates
   */
  updateTurn(updates) {
    const newTurn = updateObject(this._state.currentTurn, updates);
    return this.updateState({ currentTurn: newTurn }, 'updateTurn');
  }

  /**
   * Advance to the next player's turn
   *
   * @returns {Object} New state after updates
   */
  nextPlayerTurn() {
    const { currentTurn, players } = this._state;
    const { playerOrder, currentPlayerIndex } = currentTurn;

    // Calculate next player index
    const nextPlayerIndex = (currentPlayerIndex + 1) % playerOrder.length;

    // Skip eliminated players
    if (players[playerOrder[nextPlayerIndex]].eliminated) {
      // Update state temporarily to skip this player
      this.updateTurn({ currentPlayerIndex: nextPlayerIndex });
      // Recursively call to find next active player
      return this.nextPlayerTurn();
    }

    // Update turn state for next player
    const newTurn = updateObject(currentTurn, {
      currentPlayerIndex: nextPlayerIndex,
      selectedTerritory: null,
      targetTerritory: null,
      lastAttackResult: null,
      attackCount: 0,
    });

    return this.updateState({ currentTurn: newTurn }, 'nextPlayerTurn');
  }

  /**
   * Get the current player
   *
   * @returns {Object} Current player state
   */
  getCurrentPlayer() {
    const { currentTurn, players } = this._state;
    const { playerOrder, currentPlayerIndex } = currentTurn;
    return players[playerOrder[currentPlayerIndex]];
  }

  /**
   * Add a listener for state changes
   *
   * @param {Function} listener - Callback function for state changes
   * @returns {Function} Function to remove the listener
   */
  subscribe(listener) {
    this._listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this._listeners.delete(listener);
    };
  }

  /**
   * Add current state to history
   *
   * @param {Object} state - State to add to history
   * @param {string} actionType - Type of action
   * @private
   */
  _addToHistory(state, actionType) {
    this._history.push({
      state,
      actionType,
      timestamp: Date.now(),
    });

    // Limit history size
    if (this._history.length > this._maxHistoryLength) {
      this._history.shift();
    }
  }

  /**
   * Notify all listeners of state change
   *
   * @private
   */
  _notifyListeners() {
    for (const listener of this._listeners) {
      try {
        listener(this._state);
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    }
  }

  /**
   * Travel back in time to a previous state (for debugging)
   *
   * @param {number} steps - Number of steps to go back
   * @returns {Object} Previous state
   */
  timeTravel(steps = 1) {
    const historyIndex = Math.max(0, this._history.length - steps);
    if (historyIndex < this._history.length) {
      this._state = this._history[historyIndex].state;
      this._notifyListeners();
    }
    return this._state;
  }

  /**
   * Get history of state changes (for debugging)
   *
   * @returns {Array} State change history
   */
  getStateHistory() {
    return [...this._history];
  }
}
