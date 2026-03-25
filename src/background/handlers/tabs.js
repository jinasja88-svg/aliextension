import browser from 'webextension-polyfill';
import { ROUTES } from '../../shared/constants';

export function registerTabHandlers(router) {
  // Create new tab
  router.on(ROUTES.TAB_CREATE, async (payload) => {
    const { url, active = true, newWindow = false, width, height } = payload;

    if (newWindow) {
      const createData = { url, type: 'popup' };
      if (width) createData.width = width;
      if (height) createData.height = height;
      return browser.windows.create(createData);
    }

    return browser.tabs.create({ url, active });
  });

  // Remove tab
  router.on(ROUTES.TAB_REMOVE, async (payload) => {
    return browser.tabs.remove(payload.tabId);
  });

  // Query tabs
  router.on(ROUTES.TAB_QUERY, async (payload) => {
    return browser.tabs.query(payload);
  });

  // Get active tab
  router.on(ROUTES.TAB_QUERY_ACTIVE, async () => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0] || null;
  });

  // Send message to tab
  router.on(ROUTES.TAB_MESSAGE, async (payload) => {
    const { tabId, route, data } = payload;
    return browser.tabs.sendMessage(tabId, { route, payload: data });
  });

  // Screenshot
  router.on(ROUTES.TAB_SCREENSHOT, async () => {
    return browser.tabs.captureVisibleTab(null, {
      format: 'jpeg',
      quality: 100,
    });
  });

  // Create window
  router.on(ROUTES.WINDOW_CREATE, async (payload) => {
    return browser.windows.create(payload);
  });
}
