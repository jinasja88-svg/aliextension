import { sendMessage } from '../../shared/wext';
import { ROUTES } from '../../shared/constants';
import { createShadowHost, removeShadowHost } from './shadow-host';

const OVERLAY_ID = 'ap-screenshot-overlay';
let cropper = null;

/**
 * Start screenshot capture
 * Returns: base64 dataURL of cropped image
 */
export async function captureScreenshot() {
  // 1. Capture visible tab via background
  const screenshotDataUrl = await sendMessage(ROUTES.TAB_SCREENSHOT);
  if (!screenshotDataUrl) {
    throw new Error('Screenshot capture failed');
  }

  // 2. Show overlay with cropper
  return new Promise((resolve, reject) => {
    showCropperOverlay(screenshotDataUrl, (croppedDataUrl) => {
      hideCropperOverlay();
      resolve(croppedDataUrl);
    }, () => {
      hideCropperOverlay();
      reject(new Error('Screenshot cancelled'));
    });
  });
}

/**
 * Show the cropper overlay
 */
function showCropperOverlay(imageDataUrl, onConfirm, onCancel) {
  const shadow = createShadowHost(OVERLAY_ID);

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .ap-screenshot-container {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 2147483647;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: crosshair;
    }
    .ap-screenshot-image {
      max-width: 100vw;
      max-height: 100vh;
    }
    .ap-screenshot-toolbar {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 2147483647;
    }
    .ap-screenshot-btn {
      padding: 8px 24px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      color: #fff;
    }
    .ap-screenshot-btn-confirm {
      background: #1890ff;
    }
    .ap-screenshot-btn-confirm:hover {
      background: #40a9ff;
    }
    .ap-screenshot-btn-cancel {
      background: #666;
    }
    .ap-screenshot-btn-cancel:hover {
      background: #888;
    }
    .ap-crop-area {
      position: absolute;
      border: 2px dashed #1890ff;
      background: transparent;
    }
  `;
  shadow.appendChild(style);

  const container = document.createElement('div');
  container.className = 'ap-screenshot-container';

  // Selection variables
  let startX, startY, isSelecting = false;
  let selectionBox = null;

  const img = document.createElement('img');
  img.className = 'ap-screenshot-image';
  img.src = imageDataUrl;
  container.appendChild(img);

  // Mouse handlers for region selection
  container.addEventListener('mousedown', (e) => {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;

    if (selectionBox) selectionBox.remove();
    selectionBox = document.createElement('div');
    selectionBox.className = 'ap-crop-area';
    container.appendChild(selectionBox);
  });

  container.addEventListener('mousemove', (e) => {
    if (!isSelecting || !selectionBox) return;
    const x = Math.min(startX, e.clientX);
    const y = Math.min(startY, e.clientY);
    const w = Math.abs(e.clientX - startX);
    const h = Math.abs(e.clientY - startY);
    selectionBox.style.left = x + 'px';
    selectionBox.style.top = y + 'px';
    selectionBox.style.width = w + 'px';
    selectionBox.style.height = h + 'px';
  });

  container.addEventListener('mouseup', (e) => {
    if (!isSelecting) return;
    isSelecting = false;

    const endX = e.clientX;
    const endY = e.clientY;

    // If selection is too small, treat as cancel
    if (Math.abs(endX - startX) < 10 || Math.abs(endY - startY) < 10) {
      if (selectionBox) selectionBox.remove();
      return;
    }

    // Show confirm/cancel toolbar
    showToolbar();
  });

  function showToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'ap-screenshot-toolbar';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'ap-screenshot-btn ap-screenshot-btn-confirm';
    confirmBtn.textContent = '검색';
    confirmBtn.addEventListener('click', () => {
      const croppedDataUrl = cropImage(imageDataUrl, selectionBox, img);
      onConfirm(croppedDataUrl);
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ap-screenshot-btn ap-screenshot-btn-cancel';
    cancelBtn.textContent = '취소';
    cancelBtn.addEventListener('click', () => {
      onCancel();
    });

    toolbar.appendChild(confirmBtn);
    toolbar.appendChild(cancelBtn);
    shadow.appendChild(toolbar);
  }

  shadow.appendChild(container);

  // ESC key to cancel
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', escHandler);
      onCancel();
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Crop image using canvas
 */
function cropImage(imageDataUrl, selectionBox, imgElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.src = imageDataUrl;

  // Get selection rect relative to image
  const imgRect = imgElement.getBoundingClientRect();
  const selRect = selectionBox.getBoundingClientRect();

  const scaleX = img.naturalWidth / imgRect.width;
  const scaleY = img.naturalHeight / imgRect.height;

  const cropX = (selRect.left - imgRect.left) * scaleX;
  const cropY = (selRect.top - imgRect.top) * scaleY;
  const cropW = selRect.width * scaleX;
  const cropH = selRect.height * scaleY;

  canvas.width = cropW;
  canvas.height = cropH;

  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Hide the cropper overlay
 */
function hideCropperOverlay() {
  removeShadowHost(OVERLAY_ID);
}
