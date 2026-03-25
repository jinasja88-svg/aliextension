import { sendMessage } from './wext';
import { API_BASE, API_BASE_CN, ROUTES } from './constants';

let useFailover = false;

function getBaseUrl() {
  return useFailover ? API_BASE_CN : API_BASE;
}

/**
 * Make API request through background proxy
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    params = {},
    body = null,
    headers = {},
    baseUrl = null,
  } = options;

  let url = (baseUrl || getBaseUrl()) + endpoint;

  // Append query params for GET
  if (method === 'GET' && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += (url.includes('?') ? '&' : '?') + searchParams.toString();
  }

  try {
    const response = await sendMessage(ROUTES.REQUEST, {
      url,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: method !== 'GET' ? (typeof body === 'string' ? body : JSON.stringify(body || params)) : undefined,
    });

    // Cloudflare detection
    if (response && typeof response.data === 'string' && response.data.includes('Ray ID')) {
      throw new Error('cloudflare');
    }

    // Captcha detection
    if (response && response.data && response.data.message === 'captcha required') {
      sendMessage(ROUTES.CAPTCHA_SHOW);
      throw new Error('captcha');
    }

    return response?.data;
  } catch (err) {
    // Failover to CN API on error
    if (!useFailover && err.message !== 'captcha') {
      console.warn('[API] Failing over to CN API');
      useFailover = true;
      return apiRequest(endpoint, options);
    }
    throw err;
  }
}

/**
 * API request with CN base URL (for currency, price updates)
 */
export async function apiRequestCN(endpoint, options = {}) {
  return apiRequest(endpoint, { ...options, baseUrl: API_BASE_CN });
}

/**
 * Reset failover state
 */
export function resetFailover() {
  useFailover = false;
}
