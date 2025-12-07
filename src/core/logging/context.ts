import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Global storage for request-scoped data (like Request ID).
 * Used primarily for log correlation across async flows.
 */
export const requestContext = new AsyncLocalStorage<Map<string, unknown>>();

/**
 * Executes a callback within a distinct context scope.
 * Called by middleware to start a new request tracing session.
 */
export function runWithContext(context: Record<string, unknown>, callback: () => void) {
  const store = new Map(Object.entries(context));
  requestContext.run(store, callback);
}

/**
 * Helper to get a value from the current context safely.
 */
export function getContext<T>(key: string): T | undefined {
  const store = requestContext.getStore();
  return store?.get(key) as T | undefined;
}
