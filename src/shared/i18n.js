import browser from 'webextension-polyfill';

export function getMessage(key, substitutions) {
  return browser.i18n.getMessage(key, substitutions) || key;
}

export function getUILanguage() {
  return browser.i18n.getUILanguage();
}
