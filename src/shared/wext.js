import browser from 'webextension-polyfill';

let messageId = 0;

/**
 * Send message to background script via router
 */
export async function sendMessage(route, payload = {}) {
  const id = ++messageId;
  try {
    const response = await browser.runtime.sendMessage({
      id,
      route,
      payload,
      sender: getContext()
    });
    return response;
  } catch (err) {
    console.error(`[Wext] sendMessage failed: ${route}`, err);
    throw err;
  }
}

/**
 * Send message to a specific tab
 */
export async function sendTabMessage(tabId, route, payload = {}) {
  const id = ++messageId;
  try {
    return await browser.tabs.sendMessage(tabId, {
      id,
      route,
      payload
    });
  } catch (err) {
    console.error(`[Wext] sendTabMessage failed: ${route} -> tab ${tabId}`, err);
    throw err;
  }
}

/**
 * Register message handler
 */
const handlers = new Map();

export function onMessage(route, handler) {
  handlers.set(route, handler);
}

export function removeHandler(route) {
  handlers.delete(route);
}

/**
 * Initialize message listener (call once per context)
 */
export function initMessageListener() {
  browser.runtime.onMessage.addListener((message, sender) => {
    const { route, payload } = message;
    const handler = handlers.get(route);
    if (handler) {
      const result = handler(payload, sender, message);
      if (result instanceof Promise) {
        return result;
      }
      return Promise.resolve(result);
    }
    return false;
  });
}

/**
 * Detect current execution context
 */
function getContext() {
  if (typeof ServiceWorkerGlobalScope !== 'undefined') return 'background';
  if (typeof document !== 'undefined' && document.contentType) return 'content';
  return 'popup';
}

export { browser };
