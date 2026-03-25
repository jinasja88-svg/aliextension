/**
 * Background message router
 * Routes incoming messages to registered handlers
 */
export class Router {
  constructor() {
    this.handlers = new Map();
    this.eventHandlers = new Map();
  }

  /**
   * Register a route handler
   */
  on(route, handler) {
    this.handlers.set(route, handler);
  }

  /**
   * Remove a route handler
   */
  off(route) {
    this.handlers.delete(route);
  }

  /**
   * Emit an event to registered listeners
   */
  emit(event, ...args) {
    const listeners = this.eventHandlers.get(event) || [];
    listeners.forEach(fn => fn(...args));
  }

  /**
   * Subscribe to events
   */
  $on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * Handle incoming message — returns result or undefined
   */
  async handle(message, sender) {
    const { route, payload } = message;
    const handler = this.handlers.get(route);
    if (!handler) {
      return undefined;
    }
    try {
      return await handler(payload, sender, message);
    } catch (err) {
      console.error(`[Router] Error handling route: ${route}`, err);
      return { error: err.message };
    }
  }

  /**
   * Check if a route has a handler
   */
  has(route) {
    return this.handlers.has(route);
  }
}
