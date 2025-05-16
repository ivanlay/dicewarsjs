/**
 * Tests for the Event System handler removal
 */

import { gameEvents, EventType } from '../../src/mechanics/eventSystem.js';

describe('EventSystem handler removal', () => {
  beforeEach(() => {
    // Clear all handlers between tests
    Object.values(EventType).forEach(type => {
      gameEvents.offAll(type);
    });
  });

  it('should properly remove handlers using the subscription ID', async () => {
    let handlerCallCount = 0;
    const handler = () => {
      handlerCallCount++;
    };

    // Subscribe to an event
    const subscriptionId = gameEvents.on(EventType.GAME_START, handler);

    // Verify the handler is registered
    expect(gameEvents.hasSubscribers(EventType.GAME_START)).toBe(true);
    expect(gameEvents.subscriberCount(EventType.GAME_START)).toBe(1);

    // Emit the event to verify the handler is called
    await gameEvents.emit(EventType.GAME_START, {});
    expect(handlerCallCount).toBe(1);

    // Remove the handler
    const removed = gameEvents.off(subscriptionId);
    expect(removed).toBe(true);

    // Verify the handler is removed
    expect(gameEvents.hasSubscribers(EventType.GAME_START)).toBe(false);
    expect(gameEvents.subscriberCount(EventType.GAME_START)).toBe(0);

    // Emit the event again to verify the handler is not called
    await gameEvents.emit(EventType.GAME_START, {});
    expect(handlerCallCount).toBe(1); // Should still be 1, not 2
  });

  it('should handle multiple handlers for the same event', async () => {
    let handler1CallCount = 0;
    let handler2CallCount = 0;

    const handler1 = () => handler1CallCount++;
    const handler2 = () => handler2CallCount++;

    // Subscribe multiple handlers
    const subscriptionId1 = gameEvents.on(EventType.TURN_START, handler1);
    const subscriptionId2 = gameEvents.on(EventType.TURN_START, handler2);

    // Verify both handlers are registered
    expect(gameEvents.subscriberCount(EventType.TURN_START)).toBe(2);

    // Emit the event
    await gameEvents.emit(EventType.TURN_START, {});
    expect(handler1CallCount).toBe(1);
    expect(handler2CallCount).toBe(1);

    // Remove only the first handler
    const removed1 = gameEvents.off(subscriptionId1);
    expect(removed1).toBe(true);
    expect(gameEvents.subscriberCount(EventType.TURN_START)).toBe(1);

    // Emit the event again
    await gameEvents.emit(EventType.TURN_START, {});
    expect(handler1CallCount).toBe(1); // Should still be 1
    expect(handler2CallCount).toBe(2); // Should be 2 now

    // Remove the second handler
    const removed2 = gameEvents.off(subscriptionId2);
    expect(removed2).toBe(true);
    expect(gameEvents.subscriberCount(EventType.TURN_START)).toBe(0);
  });

  it('should handle once() subscriptions correctly', async () => {
    let handlerCallCount = 0;
    const handler = () => {
      handlerCallCount++;
    };

    // Subscribe using once
    const subscriptionId = gameEvents.once(EventType.PLAYER_ELIMINATED, handler);

    // Verify the handler is registered
    expect(gameEvents.hasSubscribers(EventType.PLAYER_ELIMINATED)).toBe(true);

    // Emit the event - handler should be called and then removed
    await gameEvents.emit(EventType.PLAYER_ELIMINATED, {});
    expect(handlerCallCount).toBe(1);

    // Verify the handler was automatically removed
    expect(gameEvents.hasSubscribers(EventType.PLAYER_ELIMINATED)).toBe(false);

    // Emit the event again - handler should not be called
    await gameEvents.emit(EventType.PLAYER_ELIMINATED, {});
    expect(handlerCallCount).toBe(1); // Should still be 1
  });

  it('should handle invalid subscription IDs gracefully', () => {
    // Try to remove with an invalid ID
    const removed = gameEvents.off('invalid_subscription_123');
    expect(removed).toBe(false);
  });

  it('should handle offAll correctly', () => {
    let handler1CallCount = 0;
    let handler2CallCount = 0;

    const handler1 = () => handler1CallCount++;
    const handler2 = () => handler2CallCount++;

    // Subscribe multiple handlers
    gameEvents.on(EventType.TERRITORY_ATTACK, handler1);
    gameEvents.on(EventType.TERRITORY_ATTACK, handler2);

    // Verify both handlers are registered
    expect(gameEvents.subscriberCount(EventType.TERRITORY_ATTACK)).toBe(2);

    // Remove all handlers for this event type
    gameEvents.offAll(EventType.TERRITORY_ATTACK);

    // Verify all handlers are removed
    expect(gameEvents.subscriberCount(EventType.TERRITORY_ATTACK)).toBe(0);

    // Emit the event - no handlers should be called
    gameEvents.emit(EventType.TERRITORY_ATTACK, {});
    expect(handler1CallCount).toBe(0);
    expect(handler2CallCount).toBe(0);
  });
});
