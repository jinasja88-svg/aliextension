import browser from 'webextension-polyfill';
import { ROUTES } from '../../shared/constants';

export function registerDnrHandlers(router) {
  router.on(ROUTES.DNR_UPDATE, async (payload) => {
    const { addRules = [], removeRuleIds = [] } = payload;
    return browser.declarativeNetRequest.updateDynamicRules({
      addRules,
      removeRuleIds,
    });
  });
}

/**
 * Initialize dynamic DNR rules that need extension ID
 */
export async function initDynamicRules() {
  // Get existing dynamic rules
  const existingRules = await browser.declarativeNetRequest.getDynamicRules();
  const existingIds = existingRules.map(r => r.id);

  // Remove old dynamic rules
  if (existingIds.length > 0) {
    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingIds,
    });
  }

  console.log('[DNR] Dynamic rules initialized');
}

/**
 * Add cookies to 1688 image search API requests
 */
export async function addCookiesTo1688ImageSearch(cookies) {
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [90001],
    addRules: [{
      id: 90001,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [{
          header: 'Cookie',
          operation: 'set',
          value: cookieStr,
        }],
      },
      condition: {
        regexFilter: '(open-s|search).1688.com/.*imageSearch.*',
        resourceTypes: ['xmlhttprequest'],
      },
    }],
  });
}

/**
 * Add cookies to Taobao image search API requests
 */
export async function addCookiesToTaobaoImageSearch(cookies) {
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [90002],
    addRules: [{
      id: 90002,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [{
          header: 'Cookie',
          operation: 'set',
          value: cookieStr,
        }],
      },
      condition: {
        regexFilter: 'h5api.m.taobao.com/.*',
        resourceTypes: ['xmlhttprequest'],
      },
    }],
  });
}
