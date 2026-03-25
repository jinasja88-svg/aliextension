/**
 * Create a Shadow DOM host for isolated UI injection
 */
export function createShadowHost(id) {
  // Check if already exists
  let host = document.getElementById(id);
  if (host) return host.shadowRoot;

  host = document.createElement('div');
  host.id = id;
  host.style.cssText = 'all: initial; position: fixed; z-index: 2147483647; top: 0; left: 0;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Add base styles
  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: #333;
    }
    * { box-sizing: border-box; }
  `;
  shadow.appendChild(style);

  return shadow;
}

/**
 * Remove shadow host
 */
export function removeShadowHost(id) {
  const host = document.getElementById(id);
  if (host) host.remove();
}
