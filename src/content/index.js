import './content-script.css';
import browser from 'webextension-polyfill';
import { detectPlatform } from '../shared/platforms';
import { initMessageListener, onMessage } from '../shared/wext';
import { initInjectBridge, sendToInject } from './inject-bridge';
import { initSearchByImage } from './features/search-by-image';

// Current platform info
let currentPlatform = null;

/**
 * Initialize content script
 */
function init() {
  // Detect current platform
  currentPlatform = detectPlatform(location.hostname);

  // Set up message listener for background -> content messages
  initMessageListener();

  // Set up bridge to inject script
  initInjectBridge();

  // Inject the inject-script into page context
  injectPageScript();

  // Register client message handlers
  registerHandlers();

  // Initialize features
  initSearchByImage(currentPlatform);

  if (currentPlatform) {
    console.log(`[Content] Platform detected: ${currentPlatform.name}`);
  }
}

/**
 * Inject inject-script.js into page context
 */
function injectPageScript() {
  const script = document.createElement('script');
  script.src = browser.runtime.getURL('assets/js/inject-script.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

/**
 * Register handlers for messages from background
 */
function registerHandlers() {
  // Image search trigger
  onMessage('client/open_image_search', (payload) => {
    const { type, imageUrl, trigger } = payload;
    if (type === 'url' && imageUrl) {
      // Direct image URL search
      import('./features/search-by-image').then(m => {
        m.startImageSearch(imageUrl, trigger);
      });
    } else {
      // Screenshot mode
      import('./features/search-by-image').then(m => {
        m.startScreenshotSearch(trigger);
      });
    }
  });

  // Translator
  onMessage('client/translator/page', (payload) => {
    console.log('[Content] Translate page requested', payload);
    // TODO: Phase 4 - Translation
  });

  onMessage('client/translator/screenshot', (payload) => {
    console.log('[Content] Screenshot translate requested', payload);
    // TODO: Phase 4 - Translation
  });

  // Captcha
  onMessage('client/captcha/show', () => {
    console.log('[Content] Captcha required');
    // TODO: Show captcha modal
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
