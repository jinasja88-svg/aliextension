import browser from 'webextension-polyfill';
import { ROUTES } from '../../shared/constants';

export function registerDownloadHandlers(router) {
  router.on(ROUTES.DOWNLOAD, async (payload) => {
    // Check if downloads permission is available
    const hasPermission = await browser.permissions.contains({
      permissions: ['downloads'],
    });
    if (!hasPermission) {
      const granted = await browser.permissions.request({
        permissions: ['downloads'],
      });
      if (!granted) throw new Error('Downloads permission denied');
    }
    return browser.downloads.download(payload);
  });

  router.on(ROUTES.DOWNLOAD_VIDEO, async (payload) => {
    const { url, filename } = payload;
    return browser.downloads.download({ url, filename });
  });

  router.on('backend/download/search', async (payload) => {
    return browser.downloads.search(payload);
  });
}
