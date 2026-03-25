import browser from 'webextension-polyfill';

const registeredMenus = new Set();

/**
 * Create or update a context menu item
 */
export function ensureContextMenu(id, options) {
  if (registeredMenus.has(id)) {
    browser.contextMenus.update(id, options).catch(() => {});
  } else {
    browser.contextMenus.create({ id, ...options }, () => {
      if (browser.runtime.lastError) {
        // Menu already exists, update it
        browser.contextMenus.update(id, options).catch(() => {});
      }
    });
    registeredMenus.add(id);
  }
}

/**
 * Initialize all context menus
 */
export function initContextMenus(router, settings = {}) {
  const {
    enableSearchByImage = true,
    enableSearchByImageScreenshot = true,
    enableTranslator = true,
    enableGoogleTranslate = true,
  } = settings;

  // Image search context menu (on images)
  if (enableSearchByImage && enableSearchByImageScreenshot) {
    ensureContextMenu('aliprice_image_search', {
      title: browser.i18n.getMessage('context_menu_screenshot_search') || 'Search by image',
      contexts: ['image'],
    });
  } else {
    browser.contextMenus.remove('aliprice_image_search').catch(() => {});
    registeredMenus.delete('aliprice_image_search');
  }

  // Translator context menu
  if (enableTranslator) {
    ensureContextMenu('aliprice_translator', {
      title: browser.i18n.getMessage('context_menus_translator') || 'Screenshot translate',
      contexts: ['page'],
    });
  } else {
    browser.contextMenus.remove('aliprice_translator').catch(() => {});
    registeredMenus.delete('aliprice_translator');
  }

  // Google Translate context menu
  if (enableGoogleTranslate) {
    ensureContextMenu('aliprice_google_translate', {
      title: browser.i18n.getMessage('context_menus_goote_trans') || 'Translate webpage',
      contexts: ['page'],
    });
  } else {
    browser.contextMenus.remove('aliprice_google_translate').catch(() => {});
    registeredMenus.delete('aliprice_google_translate');
  }

  // Context menu click dispatcher
  browser.contextMenus.onClicked.addListener((info, tab) => {
    const { menuItemId } = info;

    switch (menuItemId) {
      case 'aliprice_image_search': {
        const payload = {
          trigger: 'context_menu',
          type: info.srcUrl ? 'url' : 'screenshot',
          imageUrl: info.srcUrl || null,
        };
        browser.tabs.sendMessage(tab.id, {
          route: 'client/open_image_search',
          payload,
        }).catch(console.error);
        break;
      }

      case 'aliprice_translator':
        browser.tabs.sendMessage(tab.id, {
          route: 'client/translator/screenshot',
          payload: { trigger: 'context_menu' },
        }).catch(console.error);
        break;

      case 'aliprice_google_translate':
        browser.tabs.sendMessage(tab.id, {
          route: 'client/translator/page',
          payload: { trigger: 'context_menu' },
        }).catch(console.error);
        break;
    }

    // Emit to router for analytics
    router.emit(`backend/context_menu/click/${menuItemId}`, info, tab);
  });
}
