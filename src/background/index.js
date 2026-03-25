import browser from 'webextension-polyfill';
import { Router } from './router';
import { registerRequestHandler } from './handlers/request';
import { registerTabHandlers } from './handlers/tabs';
import { registerCookieHandlers, setMInfoCookie } from './handlers/cookies';
import { registerUploadHandlers } from './handlers/upload';
import { registerPermissionHandlers } from './handlers/permissions';
import { registerDownloadHandlers } from './handlers/download';
import { registerDnrHandlers, initDynamicRules } from './handlers/dnr';
import { initContextMenus } from './context-menu';
import { initCommands } from './commands';
import { initAlarms } from './alarms';
import { createSession } from './session';
import { initNotifications } from './notifications';
import { EXT_INFO } from '../shared/constants';

// Mark as service worker
globalThis.isServiceWorker = typeof ServiceWorkerGlobalScope !== 'undefined';

// Create router
const router = new Router();

/**
 * Initialize all background handlers
 */
function initHandlers() {
  registerRequestHandler(router);
  registerTabHandlers(router);
  registerCookieHandlers(router);
  registerUploadHandlers(router);
  registerPermissionHandlers(router);
  registerDownloadHandlers(router);
  registerDnrHandlers(router);
}

/**
 * Set up message listener that dispatches to router
 */
function initMessageListener() {
  browser.runtime.onMessage.addListener((message, sender) => {
    if (!message || !message.route) return false;

    if (router.has(message.route)) {
      return router.handle(message, sender);
    }

    return false;
  });
}

/**
 * Handle extension install/update
 */
function initInstallHandler() {
  browser.runtime.onInstalled.addListener(async (details) => {
    console.log(`[Background] Extension ${details.reason}: v${EXT_INFO.VERSION}`);

    if (details.reason === 'install') {
      // First install: open tutorial
      browser.tabs.create({
        url: browser.runtime.getURL('options.html'),
      });
    }

    // Initialize dynamic DNR rules
    await initDynamicRules();

    // Set m-info cookie
    await setMInfoCookie(EXT_INFO.VERSION);
  });
}

/**
 * Set uninstall feedback URL
 */
function initUninstallUrl() {
  browser.runtime.setUninstallURL(
    `https://www.aliprice.com/extension/feedback?ext_id=${EXT_INFO.ID}&version=${EXT_INFO.VERSION}`
  );
}

/**
 * Bootstrap the background service worker
 */
async function bootstrap() {
  console.log(`[Background] Starting AliPrice Extension v${EXT_INFO.VERSION}`);

  // 1. Register message handlers
  initHandlers();

  // 2. Set up message listener
  initMessageListener();

  // 3. Handle install/update
  initInstallHandler();

  // 4. Initialize context menus
  initContextMenus(router);

  // 5. Register keyboard shortcuts
  initCommands();

  // 6. Initialize alarms
  initAlarms();

  // 7. Create session
  await createSession();

  // 8. Initialize notifications
  initNotifications();

  // 9. Set uninstall URL
  initUninstallUrl();

  console.log('[Background] Bootstrap complete');
}

// Run bootstrap
bootstrap();
