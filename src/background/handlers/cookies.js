import browser from 'webextension-polyfill';
import { ROUTES } from '../../shared/constants';

export function registerCookieHandlers(router) {
  router.on(ROUTES.COOKIES_SET, async (payload) => {
    return browser.cookies.set(payload);
  });

  router.on(ROUTES.COOKIES_GET, async (payload) => {
    return browser.cookies.get(payload);
  });

  router.on(ROUTES.COOKIES_GET_ALL, async (payload) => {
    return browser.cookies.getAll(payload);
  });

  router.on(ROUTES.COOKIES_REMOVE, async (payload) => {
    return browser.cookies.remove(payload);
  });

  router.on(ROUTES.COOKIES_REMOVE_ALL, async (payload) => {
    const { url } = payload;
    const cookies = await browser.cookies.getAll({ url });
    const results = [];
    for (const cookie of cookies) {
      results.push(
        browser.cookies.remove({ url, name: cookie.name })
      );
    }
    return Promise.all(results);
  });
}

/**
 * Set m-info tracking cookie on aliprice.com
 */
export async function setMInfoCookie(version) {
  const info = JSON.stringify([
    'chrome',
    version,
    'chrome',
    Date.now() + Math.floor(Math.random() * 1000),
  ]);

  await browser.cookies.set({
    url: 'https://www.aliprice.com',
    name: 'm-info',
    value: encodeURIComponent(info),
    domain: '.aliprice.com',
    path: '/',
    secure: true,
    expirationDate: Math.floor(Date.now() / 1000) + 86400 * 365,
  });
}
