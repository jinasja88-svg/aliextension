import { translate } from '../../shared/translator';
import { createShadowHost, removeShadowHost } from '../ui/shadow-host';

const TRANSLATOR_STATE_ATTR = 'data-sf-translated';
const PROGRESS_ID = 'sf-translate-progress';
let isTranslated = false;
let originalTexts = new Map();

/**
 * 페이지 번역 토글 (Ctrl+Shift+2)
 */
export async function togglePageTranslation(targetLang = 'ko') {
  if (isTranslated) {
    restoreOriginal();
  } else {
    await translatePage(targetLang);
  }
}

/**
 * 페이지 전체 번역
 */
async function translatePage(targetLang = 'ko') {
  console.log('[Translator] 페이지 번역 시작...');
  originalTexts.clear();

  // 번역할 텍스트 노드 수집
  const textNodes = collectTextNodes(document.body);
  console.log(`[Translator] 텍스트 노드 ${textNodes.length}개 발견`);

  if (textNodes.length === 0) return;

  // 진행 상태 표시
  showProgress(0, textNodes.length);

  // 배치 처리 (10개씩)
  const BATCH = 10;
  let done = 0;

  for (let i = 0; i < textNodes.length; i += BATCH) {
    const batch = textNodes.slice(i, i + BATCH);
    const texts = batch.map(n => n.textContent.trim());

    // 빈 텍스트 스킵
    const validTexts = texts.filter(t => t.length > 0);
    if (validTexts.length === 0) {
      done += batch.length;
      continue;
    }

    // 배치 번역
    const promises = batch.map(async (node) => {
      const text = node.textContent.trim();
      if (!text || text.length < 2) return;

      // 이미 대상 언어면 스킵
      if (isTargetLang(text, targetLang)) return;

      try {
        const result = await translate(text, targetLang);
        if (result.translatedText && result.translatedText !== text) {
          // 원본 저장
          originalTexts.set(node, node.textContent);
          // 번역 적용
          node.textContent = result.translatedText;
        }
      } catch (err) {
        // 개별 실패는 무시
      }
    });

    await Promise.all(promises);

    done += batch.length;
    showProgress(done, textNodes.length);
  }

  isTranslated = true;
  hideProgress();
  console.log(`[Translator] 번역 완료: ${originalTexts.size}개 노드`);
}

/**
 * 원본 복원
 */
function restoreOriginal() {
  console.log('[Translator] 원본 복원...');

  for (const [node, originalText] of originalTexts) {
    try {
      node.textContent = originalText;
    } catch (e) {
      // 노드가 제거된 경우 무시
    }
  }

  originalTexts.clear();
  isTranslated = false;
  console.log('[Translator] 복원 완료');
}

/**
 * 번역할 텍스트 노드 수집
 */
function collectTextNodes(root) {
  const nodes = [];
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        // 스크립트, 스타일, 우리 UI 제외
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const tag = parent.tagName.toLowerCase();
        if (['script', 'style', 'noscript', 'code', 'pre', 'textarea', 'input'].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }

        // 우리 확장 UI 제외
        if (parent.closest('[id^="sf-"]') || parent.closest('[id^="ap-"]')) {
          return NodeFilter.FILTER_REJECT;
        }

        // 이미 번역된 노드 제외
        if (parent.getAttribute(TRANSLATOR_STATE_ATTR)) {
          return NodeFilter.FILTER_REJECT;
        }

        // 빈 텍스트 제외
        const text = node.textContent.trim();
        if (text.length < 2) return NodeFilter.FILTER_REJECT;

        // 숫자만 제외
        if (/^\d+$/.test(text)) return NodeFilter.FILTER_REJECT;

        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  return nodes;
}

/**
 * 텍스트가 이미 대상 언어인지 간단 체크
 */
function isTargetLang(text, targetLang) {
  const sample = text.substring(0, 20);
  const koreanRatio = (sample.match(/[\uAC00-\uD7AF]/g) || []).length / sample.length;
  const chineseRatio = (sample.match(/[\u4E00-\u9FFF]/g) || []).length / sample.length;

  if (targetLang === 'ko' && koreanRatio > 0.5) return true;
  if (targetLang === 'zh-CN' && chineseRatio > 0.5) return true;

  return false;
}

/**
 * 번역 진행 상태 표시
 */
function showProgress(done, total) {
  const shadow = createShadowHost(PROGRESS_ID);

  let bar = shadow.querySelector('.sf-progress-bar');
  if (!bar) {
    const style = document.createElement('style');
    style.textContent = `
      .sf-progress-bar {
        position: fixed;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: #e0e0e0;
        z-index: 2147483647;
      }
      .sf-progress-fill {
        height: 100%;
        background: #0ea5e9;
        transition: width 0.3s;
      }
      .sf-progress-text {
        position: fixed;
        top: 5px; right: 10px;
        background: rgba(14,165,233,0.9);
        color: #fff;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 2147483647;
      }
    `;
    shadow.appendChild(style);

    bar = document.createElement('div');
    bar.className = 'sf-progress-bar';
    bar.innerHTML = '<div class="sf-progress-fill"></div>';
    shadow.appendChild(bar);

    const text = document.createElement('div');
    text.className = 'sf-progress-text';
    shadow.appendChild(text);
  }

  const pct = Math.round((done / total) * 100);
  const fill = bar.querySelector('.sf-progress-fill');
  if (fill) fill.style.width = pct + '%';

  const text = shadow.querySelector('.sf-progress-text');
  if (text) text.textContent = `번역 중... ${pct}%`;
}

/**
 * 진행 상태 숨기기
 */
function hideProgress() {
  removeShadowHost(PROGRESS_ID);
}
