import { translate } from '../../shared/translator';
import { captureScreenshot } from '../ui/screenshot-overlay';
import { createShadowHost, removeShadowHost } from '../ui/shadow-host';

const MODAL_ID = 'sf-translate-modal';

/**
 * 스크린샷 번역 (Ctrl+Shift+3)
 * 1. 스크린샷 캡처 + 크롭
 * 2. 캡처된 이미지에서 텍스트 영역 표시
 * 3. (OCR은 미지원 — 대신 선택된 텍스트 또는 페이지 요소 번역)
 */
export async function startScreenshotTranslation(targetLang = 'ko') {
  try {
    // 현재 선택된 텍스트가 있으면 그걸 번역
    const selectedText = window.getSelection().toString().trim();

    if (selectedText) {
      console.log('[ScreenshotTranslator] 선택 텍스트 번역:', selectedText.substring(0, 50));
      const result = await translate(selectedText, targetLang);
      showTranslationModal(selectedText, result.translatedText, result.engine);
      return;
    }

    // 선택 텍스트 없으면 스크린샷 캡처 후 번역 모달
    const croppedDataUrl = await captureScreenshot();

    // OCR 미지원이므로 사용자에게 텍스트 입력 요청
    showInputModal(croppedDataUrl, targetLang);
  } catch (err) {
    if (err.message === 'Screenshot cancelled') return;
    console.error('[ScreenshotTranslator] 에러:', err);
  }
}

/**
 * 번역 결과 모달 표시
 */
function showTranslationModal(original, translated, engine) {
  const shadow = createShadowHost(MODAL_ID);

  // 기존 내용 제거
  const existing = shadow.querySelector('.sf-trans-modal');
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.textContent = `
    .sf-trans-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sf-trans-modal {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      width: 480px;
      max-width: 90vw;
      max-height: 80vh;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .sf-trans-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid #e8e8e8;
      background: #fafafa;
    }
    .sf-trans-title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
    .sf-trans-engine {
      font-size: 11px;
      color: #999;
      background: #f0f0f0;
      padding: 2px 8px;
      border-radius: 10px;
    }
    .sf-trans-close {
      width: 28px; height: 28px;
      border: none; border-radius: 50%;
      background: transparent;
      cursor: pointer;
      font-size: 18px;
      color: #999;
    }
    .sf-trans-close:hover { background: #e8e8e8; }
    .sf-trans-body {
      padding: 18px;
    }
    .sf-trans-section {
      margin-bottom: 14px;
    }
    .sf-trans-label {
      font-size: 11px;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .sf-trans-text {
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      padding: 10px 12px;
      background: #f8f8f8;
      border-radius: 6px;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 200px;
      overflow-y: auto;
    }
    .sf-trans-text.original {
      color: #666;
      font-size: 13px;
    }
    .sf-trans-text.translated {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
    }
    .sf-trans-actions {
      display: flex;
      gap: 8px;
      padding: 12px 18px;
      border-top: 1px solid #e8e8e8;
    }
    .sf-trans-btn {
      padding: 6px 16px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      background: #fff;
      cursor: pointer;
      font-size: 13px;
      color: #333;
    }
    .sf-trans-btn:hover { background: #f5f5f5; }
    .sf-trans-btn.primary {
      background: #0ea5e9;
      color: #fff;
      border-color: #0ea5e9;
    }
    .sf-trans-btn.primary:hover { background: #0284c7; }
  `;
  shadow.appendChild(style);

  const overlay = document.createElement('div');
  overlay.className = 'sf-trans-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  overlay.innerHTML = `
    <div class="sf-trans-modal">
      <div class="sf-trans-header">
        <span class="sf-trans-title">번역 결과</span>
        <span class="sf-trans-engine">${engine || 'auto'}</span>
        <button class="sf-trans-close">×</button>
      </div>
      <div class="sf-trans-body">
        <div class="sf-trans-section">
          <div class="sf-trans-label">원문</div>
          <div class="sf-trans-text original">${escapeHtml(original)}</div>
        </div>
        <div class="sf-trans-section">
          <div class="sf-trans-label">번역</div>
          <div class="sf-trans-text translated">${escapeHtml(translated)}</div>
        </div>
      </div>
      <div class="sf-trans-actions">
        <button class="sf-trans-btn primary" id="sf-copy-btn">복사</button>
        <button class="sf-trans-btn" id="sf-close-btn">닫기</button>
      </div>
    </div>
  `;

  shadow.appendChild(overlay);

  // 이벤트
  shadow.querySelector('.sf-trans-close').addEventListener('click', closeModal);
  shadow.querySelector('#sf-close-btn').addEventListener('click', closeModal);
  shadow.querySelector('#sf-copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(translated).then(() => {
      const btn = shadow.querySelector('#sf-copy-btn');
      btn.textContent = '복사됨!';
      setTimeout(() => btn.textContent = '복사', 1500);
    });
  });

  // ESC 닫기
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', escHandler);
      closeModal();
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * 텍스트 입력 모달 (OCR 대체)
 */
function showInputModal(imageDataUrl, targetLang) {
  const shadow = createShadowHost(MODAL_ID);

  const style = document.createElement('style');
  style.textContent = `
    .sf-trans-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sf-trans-modal {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      width: 500px;
      max-width: 90vw;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .sf-trans-header {
      padding: 14px 18px;
      border-bottom: 1px solid #e8e8e8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sf-trans-title { font-size: 15px; font-weight: 600; }
    .sf-trans-close {
      width: 28px; height: 28px;
      border: none; border-radius: 50%;
      background: transparent;
      cursor: pointer; font-size: 18px; color: #999;
    }
    .sf-trans-body { padding: 18px; }
    .sf-trans-img {
      width: 100%;
      max-height: 200px;
      object-fit: contain;
      border-radius: 6px;
      margin-bottom: 12px;
      background: #f0f0f0;
    }
    .sf-trans-textarea {
      width: 100%;
      min-height: 80px;
      padding: 10px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      font-size: 14px;
      resize: vertical;
      font-family: inherit;
    }
    .sf-trans-textarea:focus { outline: none; border-color: #0ea5e9; }
    .sf-trans-result {
      margin-top: 12px;
      padding: 10px 12px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      font-size: 14px;
      line-height: 1.6;
      display: none;
    }
    .sf-trans-actions {
      padding: 12px 18px;
      border-top: 1px solid #e8e8e8;
      display: flex; gap: 8px;
    }
    .sf-trans-btn {
      padding: 6px 16px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      background: #fff;
      cursor: pointer;
      font-size: 13px;
    }
    .sf-trans-btn.primary {
      background: #0ea5e9; color: #fff; border-color: #0ea5e9;
    }
  `;
  shadow.appendChild(style);

  const overlay = document.createElement('div');
  overlay.className = 'sf-trans-overlay';

  overlay.innerHTML = `
    <div class="sf-trans-modal">
      <div class="sf-trans-header">
        <span class="sf-trans-title">스크린샷 번역</span>
        <button class="sf-trans-close">×</button>
      </div>
      <div class="sf-trans-body">
        <img class="sf-trans-img" src="${imageDataUrl}" />
        <textarea class="sf-trans-textarea" placeholder="번역할 텍스트를 입력하세요..."></textarea>
        <div class="sf-trans-result"></div>
      </div>
      <div class="sf-trans-actions">
        <button class="sf-trans-btn primary" id="sf-translate-btn">번역</button>
        <button class="sf-trans-btn" id="sf-close-btn">닫기</button>
      </div>
    </div>
  `;

  shadow.appendChild(overlay);

  // 이벤트
  shadow.querySelector('.sf-trans-close').addEventListener('click', closeModal);
  shadow.querySelector('#sf-close-btn').addEventListener('click', closeModal);
  shadow.querySelector('#sf-translate-btn').addEventListener('click', async () => {
    const textarea = shadow.querySelector('.sf-trans-textarea');
    const resultDiv = shadow.querySelector('.sf-trans-result');
    const text = textarea.value.trim();
    if (!text) return;

    const btn = shadow.querySelector('#sf-translate-btn');
    btn.textContent = '번역 중...';
    btn.disabled = true;

    const result = await translate(text, targetLang);
    resultDiv.textContent = result.translatedText;
    resultDiv.style.display = 'block';

    btn.textContent = '번역';
    btn.disabled = false;
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
}

function closeModal() {
  removeShadowHost(MODAL_ID);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
