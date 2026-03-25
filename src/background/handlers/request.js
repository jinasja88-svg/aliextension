import { ROUTES } from '../../shared/constants';

/**
 * Register backend/request handler for HTTP proxy
 * All popup/content script HTTP requests go through this to bypass CORS
 */
export function registerRequestHandler(router) {
  router.on(ROUTES.REQUEST, async (payload) => {
    const { url, method = 'GET', headers = {}, body, responseType = 'json' } = payload;

    try {
      const fetchOptions = {
        method,
        headers: { ...headers },
      };

      if (body && method !== 'GET') {
        fetchOptions.body = typeof body === 'object' ? JSON.stringify(body) : body;
      }

      const response = await fetch(url, fetchOptions);

      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data;
      if (responseType === 'json') {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      } else if (responseType === 'blob') {
        const blob = await response.blob();
        // Convert blob to base64 for message passing
        const reader = new FileReader();
        data = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } else {
        data = await response.text();
      }

      return {
        status: response.status,
        headers: responseHeaders,
        data,
        ok: response.ok,
      };
    } catch (err) {
      console.error('[Request] Fetch error:', url, err);
      return {
        status: 0,
        headers: {},
        data: null,
        ok: false,
        error: err.message,
      };
    }
  });
}
