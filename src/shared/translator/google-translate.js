import { sendMessage } from '../wext';
import { ROUTES } from '../constants';

const TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';

/**
 * Google Translate API로 텍스트 번역
 * @param {string} text - 번역할 텍스트
 * @param {string} targetLang - 대상 언어 (ko, en, zh-CN 등)
 * @param {string} sourceLang - 원본 언어 (auto면 자동 감지)
 * @returns {Promise<{translatedText: string, detectedLang: string}>}
 */
export async function translateText(text, targetLang = 'ko', sourceLang = 'auto') {
  if (!text || !text.trim()) return { translatedText: '', detectedLang: '' };

  const params = new URLSearchParams({
    client: 'gtx',
    sl: sourceLang,
    tl: targetLang,
    dt: 't',
    q: text,
  });

  const url = `${TRANSLATE_API}?${params.toString()}`;

  try {
    const response = await sendMessage(ROUTES.REQUEST, {
      url,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response || !response.ok || !response.data) {
      console.error('[GoogleTranslate] 요청 실패:', response?.status);
      return { translatedText: text, detectedLang: '' };
    }

    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

    // 응답 형식: [[["번역된 텍스트","원본 텍스트",null,null,10]],null,"감지된 언어"]
    let translatedText = '';
    if (Array.isArray(data) && Array.isArray(data[0])) {
      translatedText = data[0].map(item => item[0] || '').join('');
    }

    const detectedLang = data[2] || sourceLang;

    return { translatedText, detectedLang };
  } catch (err) {
    console.error('[GoogleTranslate] 에러:', err);
    return { translatedText: text, detectedLang: '' };
  }
}

/**
 * 여러 텍스트를 한번에 번역 (배치)
 */
export async function translateBatch(texts, targetLang = 'ko', sourceLang = 'auto') {
  const results = [];
  // Google Translate는 배치 미지원이므로 순차 처리 (너무 많으면 청크)
  const CHUNK_SIZE = 5;

  for (let i = 0; i < texts.length; i += CHUNK_SIZE) {
    const chunk = texts.slice(i, i + CHUNK_SIZE);
    const promises = chunk.map(text => translateText(text, targetLang, sourceLang));
    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
  }

  return results;
}
