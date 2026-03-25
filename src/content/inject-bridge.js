const BRIDGE_PREFIX = '__ALIPRICE__';
const pendingRequests = new Map();
let requestId = 0;

/**
 * Initialize the bridge listener
 */
export function initInjectBridge() {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (!event.data || !event.data.type) return;
    if (!event.data.type.startsWith(BRIDGE_PREFIX + '_RESPONSE_')) return;

    const id = event.data.id;
    const pending = pendingRequests.get(id);
    if (pending) {
      pending.resolve(event.data.payload);
      pendingRequests.delete(id);
    }
  });
}

/**
 * Send action to inject script and wait for response
 */
export function sendToInject(action, data = {}) {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    const timeout = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`Inject bridge timeout: ${action}`));
    }, 10000);

    pendingRequests.set(id, {
      resolve: (result) => {
        clearTimeout(timeout);
        resolve(result);
      },
    });

    window.postMessage({
      type: `${BRIDGE_PREFIX}_ACTION`,
      id,
      action,
      data,
    }, '*');
  });
}

/**
 * Action types for inject script
 */
export const InjectActions = {
  READ_PROPERTY: 'READ_PROPERTY',
  READ_PROPERTY_ASYNC: 'READ_PROPERTY_ASYNC',
  SET_PROPERTY: 'SET_PROPERTY',
  EVAL: 'EVAL',
  GET_HOST_REQUEST_HEADERS: 'GET_HOST_REQUEST_HEADERS',
  EXTRACT_PRODUCT_DATA: 'EXTRACT_PRODUCT_DATA',
};
