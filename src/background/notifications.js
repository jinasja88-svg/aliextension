import browser from 'webextension-polyfill';

const notificationCallbacks = new Map();

/**
 * Show system notification
 */
export function showNotification(id, options, onClick) {
  const notifId = id || `aliprice_${Date.now()}`;

  browser.notifications.create(notifId, {
    type: 'basic',
    iconUrl: browser.runtime.getURL('icons/128.png'),
    ...options,
  });

  if (onClick) {
    notificationCallbacks.set(notifId, onClick);
  }

  return notifId;
}

/**
 * Initialize notification event listeners
 */
export function initNotifications() {
  browser.notifications.onClicked.addListener((notifId) => {
    const callback = notificationCallbacks.get(notifId);
    if (callback) {
      callback(notifId);
      notificationCallbacks.delete(notifId);
    }
    browser.notifications.clear(notifId);
  });

  browser.notifications.onClosed.addListener((notifId) => {
    notificationCallbacks.delete(notifId);
  });
}
