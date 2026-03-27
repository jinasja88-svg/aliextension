import { sendMessage } from '../../shared/wext';
import { ROUTES } from '../../shared/constants';
import { captureScreenshot } from '../ui/screenshot-overlay';
import { showResultsPanel, showLoadingPanel } from '../ui/aside-panel';
import { search1688ByImage } from '../../shared/image-search/alibaba-cn';

/**
 * Initialize image search feature
 */
export function initSearchByImage(platform) {
  // Feature initialized
}

/**
 * Start image search with a direct image URL
 */
export async function startImageSearch(imageUrl, trigger = 'unknown') {
  try {
    showLoadingPanel();
    console.log('[ImageSearch] 이미지 URL로 검색 시작:', imageUrl);

    // 이미지 URL → dataURL 변환 (canvas 사용)
    const dataUrl = await imageUrlToDataUrl(imageUrl);
    if (!dataUrl) {
      console.error('[ImageSearch] 이미지 변환 실패');
      showResultsPanel([]);
      return;
    }

    await searchAllPlatforms(dataUrl);
  } catch (err) {
    console.error('[ImageSearch] Error:', err);
    showResultsPanel([]);
  }
}

/**
 * Start screenshot-based image search
 */
export async function startScreenshotSearch(trigger = 'unknown') {
  try {
    const croppedDataUrl = await captureScreenshot();
    showLoadingPanel();
    console.log('[ImageSearch] 스크린샷으로 검색 시작');
    await searchAllPlatforms(croppedDataUrl);
  } catch (err) {
    if (err.message === 'Screenshot cancelled') return;
    console.error('[ImageSearch] Screenshot error:', err);
    showResultsPanel([]);
  }
}

/**
 * 이미지 URL을 canvas를 이용해 dataURL로 변환
 */
function imageUrlToDataUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      } catch (e) {
        console.warn('[ImageSearch] Canvas 변환 실패, background로 시도:', e.message);
        // CORS 에러 시 background에서 fetch
        fetchViaBackground(url).then(resolve);
      }
    };

    img.onerror = () => {
      console.warn('[ImageSearch] 이미지 로드 실패, background로 시도');
      fetchViaBackground(url).then(resolve);
    };

    img.src = url;
  });
}

/**
 * Background 서비스 워커를 통해 이미지 fetch
 */
async function fetchViaBackground(url) {
  try {
    const dataUrl = await sendMessage(ROUTES.FETCH_FILE_DATAURL, { url });
    return dataUrl;
  } catch (err) {
    console.error('[ImageSearch] Background fetch 실패:', err);
    return null;
  }
}

/**
 * 모든 플랫폼에서 검색
 */
async function searchAllPlatforms(dataUrl) {
  if (!dataUrl) {
    showResultsPanel([]);
    return;
  }

  console.log('[ImageSearch] 1688 검색 시작...');

  try {
    const results = await search1688ByImage(dataUrl);
    console.log(`[ImageSearch] 1688 결과: ${results.length}건`);
    showResultsPanel(results);
  } catch (err) {
    console.error('[ImageSearch] 검색 실패:', err);
    showResultsPanel([]);
  }
}
