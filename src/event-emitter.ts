import { EventEmitter as NodeEventEmitter } from 'events';

import { CardReaderEvents, EventListener } from './types';

/**
 * Enhanced EventEmitter with full TypeScript support for Thai National ID Card Reader events
 *
 * Provides type-safe event handling with typing for all card reader events,
 * ensuring compile-time safety and excellent developer experience with IntelliSense.
 */
export class CardReaderEventEmitter extends NodeEventEmitter {
  constructor() {
    super();

    // Set maximum listeners to prevent memory leak warnings for applications
    // that may need to register multiple listeners for the same event
    this.setMaxListeners(20);
  }

  /**
   * Register a typed event listener
   * @param event - The event name to listen for
   * @param listener - The typed event listener function
   * @returns This instance for chaining
   */
  on<K extends keyof CardReaderEvents>(event: K, listener: EventListener<CardReaderEvents[K]>): this {
    return super.on(event, listener);
  }

  /**
   * Emit a typed event with data validation
   * @param event - The event name to emit
   * @param data - The typed event data
   * @returns True if the event had listeners, false otherwise
   */
  emit<K extends keyof CardReaderEvents>(event: K, data: CardReaderEvents[K]): boolean {
    return super.emit(event, data);
  }

  /**
   * Remove a specific typed event listener
   * @param event - The event name
   * @param listener - The specific listener to remove
   * @returns This instance for chaining
   */
  off<K extends keyof CardReaderEvents>(event: K, listener: EventListener<CardReaderEvents[K]>): this {
    return super.off(event, listener);
  }

  /**
   * Register a one-time typed event listener
   * @param event - The event name to listen for
   * @param listener - The typed event listener function (called only once)
   * @returns This instance for chaining
   */
  once<K extends keyof CardReaderEvents>(event: K, listener: EventListener<CardReaderEvents[K]>): this {
    return super.once(event, listener);
  }

  /**
   * Remove all listeners for a specific event or all events
   * @param event - Optional specific event name to clear
   * @returns This instance for chaining
   */
  removeAllListeners(event?: keyof CardReaderEvents): this {
    return super.removeAllListeners(event);
  }

  /**
   * Get the number of listeners for a specific event
   * @param event - The event name
   * @returns Number of listeners registered for the event
   */
  listenerCount(event: keyof CardReaderEvents): number {
    return super.listenerCount(event);
  }

  /**
   * Get all listeners for a specific event
   * @param event - The event name
   * @returns Array of listener functions
   */
  listeners(event: keyof CardReaderEvents): ((..._args: unknown[]) => void)[] {
    return super.listeners(event) as ((..._args: unknown[]) => void)[];
  }

  /**
   * Get all registered event names
   * @returns Array of event names that have listeners
   */
  eventNames(): Array<keyof CardReaderEvents> {
    return super.eventNames() as Array<keyof CardReaderEvents>;
  }

  /**
   * Add a listener to the beginning of the listeners array
   * @param event - The event name to listen for
   * @param listener - The typed event listener function
   * @returns This instance for chaining
   */
  prependListener<K extends keyof CardReaderEvents>(event: K, listener: EventListener<CardReaderEvents[K]>): this {
    return super.prependListener(event, listener);
  }

  /**
   * Add a one-time listener to the beginning of the listeners array
   * @param event - The event name to listen for
   * @param listener - The typed event listener function (called only once)
   * @returns This instance for chaining
   */
  prependOnceListener<K extends keyof CardReaderEvents>(event: K, listener: EventListener<CardReaderEvents[K]>): this {
    return super.prependOnceListener(event, listener);
  }
}
