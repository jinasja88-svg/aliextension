import { startImageSearch } from '../features/search-by-image';

const MIN_IMAGE_SIZE = 60;
let observer = null;
let hoverTimeout = null;

/**
 * Initialize hover buttons on product images
 */
export function initHoverButtons(platform) {
  // Works on all pages (not just detected platforms)

  // Observe for dynamically loaded images
  observer = new MutationObserver(() => {
    attachHoverButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial scan
  attachHoverButtons();
}

/**
 * Attach hover buttons to qualifying images
 */
function attachHoverButtons() {
  const images = document.querySelectorAll('img:not([data-ap-hover])');

  images.forEach(img => {
    if (img.closest('[id^="ap-"]')) return; // Skip our own UI
    img.setAttribute('data-ap-hover', 'true');

    function bindHover() {
      // Only attach to images large enough
      if (img.naturalWidth < MIN_IMAGE_SIZE || img.naturalHeight < MIN_IMAGE_SIZE) return;

      img.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(() => showHoverButton(img), 300);
      });

      img.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        setTimeout(() => hideHoverButton(img), 200);
      });
    }

    if (img.complete) {
      bindHover();
    } else {
      img.addEventListener('load', bindHover, { once: true });
    }
  });
}

/**
 * Show search button on image
 */
function showHoverButton(img) {
  if (img.querySelector('.ap-hover-btn')) return;

  const wrapper = img.parentElement;
  if (!wrapper) return;

  const btn = document.createElement('div');
  btn.className = 'ap-hover-btn';
  btn.style.cssText = `
    position: absolute;
    top: 4px; right: 4px;
    width: 28px; height: 28px;
    background: rgba(24, 144, 255, 0.9);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    color: white;
    font-size: 14px;
  `;
  btn.innerHTML = '🔍';
  btn.title = '이미지로 검색';

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    startImageSearch(img.src, 'hover_button');
  });

  // Ensure parent is positioned
  const parentPosition = window.getComputedStyle(wrapper).position;
  if (parentPosition === 'static') {
    wrapper.style.position = 'relative';
  }

  wrapper.appendChild(btn);
}

/**
 * Hide search button from image
 */
function hideHoverButton(img) {
  const wrapper = img.parentElement;
  if (!wrapper) return;
  const btn = wrapper.querySelector('.ap-hover-btn');
  if (btn && !btn.matches(':hover')) {
    btn.remove();
  }
}

/**
 * Destroy hover button observer
 */
export function destroyHoverButtons() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
