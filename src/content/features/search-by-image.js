import { sendMessage } from '../../shared/wext';
import { ROUTES } from '../../shared/constants';
import { captureScreenshot } from '../ui/screenshot-overlay';
import { showResultsPanel, showLoadingPanel, appendResults } from '../ui/aside-panel';

/**
 * Initialize image search feature
 */
export function initSearchByImage(platform) {
  // TODO: Add hover buttons on product images
  // initHoverButtons(platform);
}

/**
 * Start image search with a direct image URL
 */
export async function startImageSearch(imageUrl, trigger = 'unknown') {
  try {
    showLoadingPanel();

    // Fetch image as dataURL via background
    const dataUrl = await sendMessage(ROUTES.FETCH_FILE_DATAURL, { url: imageUrl });

    // Upload and search
    await uploadAndSearch(dataUrl);
  } catch (err) {
    console.error('[ImageSearch] Error:', err);
  }
}

/**
 * Start screenshot-based image search
 */
export async function startScreenshotSearch(trigger = 'unknown') {
  try {
    // Capture and crop screenshot
    const croppedDataUrl = await captureScreenshot();

    showLoadingPanel();

    // Upload and search
    await uploadAndSearch(croppedDataUrl);
  } catch (err) {
    if (err.message === 'Screenshot cancelled') return;
    console.error('[ImageSearch] Screenshot error:', err);
  }
}

/**
 * Upload image and search across platforms
 */
async function uploadAndSearch(dataUrl) {
  try {
    // 1. Upload to AliPrice
    const uploadResult = await sendMessage(ROUTES.UPLOAD_IMAGE, { dataUrl });

    if (uploadResult && uploadResult.uploadKey) {
      // 2. Get analysis results
      const analysisResult = await sendMessage(ROUTES.IMAGE_ANALYSIS, {
        uploadKey: uploadResult.uploadKey,
      });

      if (analysisResult && analysisResult.results) {
        showResultsPanel(normalizeResults(analysisResult.results));
        return;
      }
    }

    // 3. Fallback: Direct platform searches (parallel)
    await searchPlatformsDirect(dataUrl);
  } catch (err) {
    console.error('[ImageSearch] Upload/search error:', err);
    // Try direct platform search as fallback
    await searchPlatformsDirect(dataUrl);
  }
}

/**
 * Search platforms directly (without AliPrice proxy)
 */
async function searchPlatformsDirect(dataUrl) {
  const platforms = [
    () => search1688(dataUrl),
    () => searchGoogleLens(dataUrl),
  ];

  // Run platform searches in parallel
  const settled = await Promise.allSettled(platforms.map(fn => fn()));

  const allResults = [];
  settled.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      allResults.push(...result.value);
    }
  });

  showResultsPanel(allResults);
}

/**
 * Search 1688 via image
 */
async function search1688(dataUrl) {
  try {
    const result = await sendMessage(ROUTES.UPLOAD_PROXY, {
      url: 'https://open-s.alibaba.com/openservice/imageSearchOfferResultViewService',
      method: 'POST',
      formData: {
        image: { dataUrl, filename: 'search.jpg' },
      },
    });

    if (result && result.data && result.data.data) {
      return (result.data.data.offerList || []).map(item => ({
        title: item.subject || item.title || '',
        price: item.priceDisplay || item.price || '',
        imageUrl: item.imgUrl || item.imageUrl || '',
        productUrl: `https://detail.1688.com/offer/${item.offerId}.html`,
        platform: '1688',
      }));
    }
  } catch (err) {
    console.error('[ImageSearch] 1688 search error:', err);
  }
  return [];
}

/**
 * Search Google Lens via image
 */
async function searchGoogleLens(dataUrl) {
  try {
    const result = await sendMessage(ROUTES.UPLOAD_PROXY, {
      url: 'https://lens.google.com/v3/upload',
      method: 'POST',
      formData: {
        encoded_image: { dataUrl, filename: 'search.jpg' },
      },
    });

    // Google Lens returns HTML, parse for product results
    // This is a simplified version - full parsing needs more work
    if (result && result.data) {
      console.log('[ImageSearch] Google Lens response received');
      // TODO: Parse Google Lens HTML response for product results
    }
  } catch (err) {
    console.error('[ImageSearch] Google Lens error:', err);
  }
  return [];
}

/**
 * Normalize results from various sources
 */
function normalizeResults(results) {
  if (!Array.isArray(results)) return [];
  return results.map(r => ({
    title: r.title || r.subject || '',
    price: r.price || r.priceDisplay || '',
    imageUrl: r.imageUrl || r.imgUrl || r.image || '',
    productUrl: r.productUrl || r.url || r.detailUrl || '#',
    platform: r.platform || r.source || 'unknown',
  }));
}
