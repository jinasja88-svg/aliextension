import browser from 'webextension-polyfill';
import { ROUTES } from '../../shared/constants';

export function registerPermissionHandlers(router) {
  router.on(ROUTES.PERMISSIONS_CONTAINS, async (payload) => {
    return browser.permissions.contains(payload);
  });

  router.on(ROUTES.PERMISSIONS_REQUEST, async (payload) => {
    return browser.permissions.request(payload);
  });

  router.on(ROUTES.PERMISSIONS_REMOVE, async (payload) => {
    return browser.permissions.remove(payload);
  });
}
