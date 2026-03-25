import browser from 'webextension-polyfill';

export function initCommands() {
  browser.commands.onCommand.addListener((command, tab) => {
    if (!tab?.id) return;

    switch (command) {
      case 'screenshotToImageSearch':
        browser.tabs.sendMessage(tab.id, {
          route: 'client/open_image_search',
          payload: { trigger: 'shortcut', type: 'screenshot' },
        }).catch(console.error);
        break;

      case 'translateWebpage':
        browser.tabs.sendMessage(tab.id, {
          route: 'client/translator/page',
          payload: { trigger: 'shortcut' },
        }).catch(console.error);
        break;

      case 'screenshotToTranslate':
        browser.tabs.sendMessage(tab.id, {
          route: 'client/translator/screenshot',
          payload: { trigger: 'shortcut' },
        }).catch(console.error);
        break;
    }
  });
}
