(function() {
  'use strict';

  const BRIDGE_PREFIX = '__ALIPRICE__';

  /**
   * Listen for actions from content script
   */
  window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    if (!event.data || event.data.type !== BRIDGE_PREFIX + '_ACTION') return;

    const { id, action, data } = event.data;

    handleAction(action, data).then(result => {
      window.postMessage({
        type: BRIDGE_PREFIX + '_RESPONSE_' + action,
        id: id,
        payload: result,
      }, '*');
    }).catch(err => {
      window.postMessage({
        type: BRIDGE_PREFIX + '_RESPONSE_' + action,
        id: id,
        payload: { error: err.message },
      }, '*');
    });
  });

  /**
   * Handle actions from content script
   */
  async function handleAction(action, data) {
    switch (action) {
      case 'READ_PROPERTY':
        return readProperty(data.path);

      case 'READ_PROPERTY_ASYNC':
        return readPropertyAsync(data.path, data.interval || 300, data.maxAttempts || 10);

      case 'SET_PROPERTY':
        return setProperty(data.path, data.value);

      case 'EVAL':
        return evalCode(data.code);

      case 'GET_HOST_REQUEST_HEADERS':
        return setupHeaderCapture(data.urlPattern);

      case 'EXTRACT_PRODUCT_DATA':
        return extractProductData(data.platform);

      default:
        return { error: 'Unknown action: ' + action };
    }
  }

  /**
   * Read property from window by dot-separated path
   */
  function readProperty(path) {
    const parts = path.split('.');
    let obj = window;
    for (const part of parts) {
      if (obj == null) return undefined;
      obj = obj[part];
    }
    // Serialize to avoid cloning issues
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return String(obj);
    }
  }

  /**
   * Read property with polling (wait for data to load)
   */
  function readPropertyAsync(path, interval, maxAttempts) {
    return new Promise((resolve) => {
      let attempts = 0;
      const timer = setInterval(() => {
        attempts++;
        const value = readProperty(path);
        if (value !== undefined && value !== null) {
          clearInterval(timer);
          resolve(value);
        } else if (attempts >= maxAttempts) {
          clearInterval(timer);
          resolve(null);
        }
      }, interval);
    });
  }

  /**
   * Set property on window by dot-separated path
   */
  function setProperty(path, value) {
    const parts = path.split('.');
    let obj = window;
    for (let i = 0; i < parts.length - 1; i++) {
      if (obj[parts[i]] == null) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    return true;
  }

  /**
   * Evaluate JavaScript in page context
   */
  function evalCode(code) {
    try {
      return eval(code);
    } catch (err) {
      return { error: err.message };
    }
  }

  /**
   * Setup XHR header capture for given URL pattern
   */
  function setupHeaderCapture(urlPattern) {
    const regex = new RegExp(urlPattern);
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSetHeader = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
      if (!this._capturedHeaders) this._capturedHeaders = {};
      this._capturedHeaders[name] = value;
      return originalSetHeader.apply(this, arguments);
    };

    XMLHttpRequest.prototype.open = function(method, url) {
      this.addEventListener('readystatechange', function() {
        if (this.readyState === 4 && regex.test(url)) {
          window.postMessage({
            type: BRIDGE_PREFIX + '_RESPONSE_GET_HOST_REQUEST_HEADERS',
            id: 0,
            payload: {
              url: url,
              headers: this._capturedHeaders || {},
            },
          }, '*');
        }
      });
      return originalOpen.apply(this, arguments);
    };

    return { status: 'capturing', pattern: urlPattern };
  }

  /**
   * Extract product data based on platform
   */
  function extractProductData(platform) {
    switch (platform) {
      case '1688':
        return extract1688Data();
      case 'taobao':
        return extractTaobaoData();
      case 'tmall':
        return extractTmallData();
      case 'aliexpress':
        return extractAliExpressData();
      case 'coupang':
        return extractCoupangData();
      default:
        return { error: 'Unsupported platform: ' + platform };
    }
  }

  // ========== Platform Extractors ==========

  /**
   * 1688 (Alibaba CN) data extraction
   */
  function extract1688Data() {
    // Try __INIT_DATA first
    if (window.__INIT_DATA) {
      const data = window.__INIT_DATA;
      return normalizeProductData({
        raw: data,
        source: '__INIT_DATA',
        offerDetail: data.data?.offerDetail || data.offerDetail,
        tradeModel: data.data?.tradeModel,
        sellerModel: data.data?.sellerModel,
        skuModel: data.data?.skuModel,
        skuInfoMap: data.data?.skuInfoMap,
        offerBaseInfo: data.data?.offerBaseInfo,
      });
    }

    // Try window.context.result
    if (window.context && window.context.result) {
      return normalizeProductData({
        raw: window.context.result,
        source: 'context.result',
      });
    }

    // Try React fiber from .pc-sku-wrapper
    const skuWrapper = document.querySelector('.pc-sku-wrapper');
    if (skuWrapper) {
      const fiber = getReactFiber(skuWrapper);
      if (fiber) {
        return normalizeProductData({
          raw: fiber.memoizedProps || fiber.pendingProps,
          source: 'react-fiber',
        });
      }
    }

    return null;
  }

  /**
   * Taobao data extraction
   */
  function extractTaobaoData() {
    const gConfig = window.g_config;
    let skuData = null;

    try {
      skuData = window.Hub && window.Hub.config && window.Hub.config.get('sku');
    } catch (e) {}

    if (gConfig || skuData) {
      return normalizeProductData({
        raw: { gConfig, skuData },
        source: 'g_config',
      });
    }

    return null;
  }

  /**
   * TMall data extraction
   */
  function extractTmallData() {
    // New version: React-based
    const basicContent = document.querySelector('[class*="BasicContent--root--"]');
    if (basicContent) {
      const fiber = getReactFiber(basicContent);
      if (fiber) {
        // Walk up to find detail props
        let current = fiber;
        for (let i = 0; i < 20 && current; i++) {
          const props = current.memoizedProps || current.pendingProps;
          if (props && props.detail) {
            return normalizeProductData({
              raw: props.detail,
              source: 'react-props',
            });
          }
          current = current.return;
        }
      }
    }

    // Old version: TShop.Setup
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const text = script.textContent || '';
      if (text.includes('TShop.Setup')) {
        const match = text.match(/TShop\.Setup\((\{[\s\S]*?\})\)/);
        if (match) {
          try {
            const data = JSON.parse(match[1]);
            return normalizeProductData({
              raw: data,
              source: 'TShop.Setup',
            });
          } catch (e) {}
        }
      }
    }

    return null;
  }

  /**
   * AliExpress data extraction
   */
  function extractAliExpressData() {
    // Try __NEXT_DATA__
    const nextData = document.getElementById('__NEXT_DATA__');
    if (nextData) {
      try {
        const data = JSON.parse(nextData.textContent);
        return normalizeProductData({
          raw: data.props?.pageProps,
          source: '__NEXT_DATA__',
        });
      } catch (e) {}
    }

    return null;
  }

  /**
   * Coupang data extraction
   */
  function extractCoupangData() {
    // Extract from page embedded data
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent);
        if (data['@type'] === 'Product') {
          return normalizeProductData({
            raw: data,
            source: 'ld+json',
          });
        }
      } catch (e) {}
    }

    return null;
  }

  // ========== Utilities ==========

  /**
   * Get React fiber from DOM element
   */
  function getReactFiber(element) {
    const key = Object.keys(element).find(k =>
      k.startsWith('__reactFiber$') ||
      k.startsWith('__reactInternalInstance$')
    );
    return key ? element[key] : null;
  }

  /**
   * Normalize product data to standard format
   */
  function normalizeProductData(extracted) {
    try {
      return JSON.parse(JSON.stringify(extracted));
    } catch {
      return { error: 'Failed to serialize product data' };
    }
  }

  console.log('[AliPrice Inject] Initialized');
})();
