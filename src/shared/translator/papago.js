import { sendMessage } from '../wext';
import { ROUTES } from '../constants';

const PAPAGO_API = 'https://papago.naver.com/apis/n2mt/translate';

/**
 * Naver Papago로 텍스트 번역
 * @param {string} text - 번역할 텍스트
 * @param {string} targetLang - 대상 언어 (ko, en, zh-CN, ja 등)
 * @param {string} sourceLang - 원본 언어 (auto면 자동 감지)
 * @returns {Promise<{translatedText: string, detectedLang: string}>}
 */
export async function translateWithPapago(text, targetLang = 'ko', sourceLang = 'auto') {
  if (!text || !text.trim()) return { translatedText: '', detectedLang: '' };

  // Papago 언어 코드 변환
  const papagoSource = mapLangCode(sourceLang === 'auto' ? 'auto' : sourceLang);
  const papagoTarget = mapLangCode(targetLang);

  try {
    // 자동 감지가 필요하면 detectLang 먼저
    let actualSource = papagoSource;
    if (actualSource === 'auto') {
      actualSource = detectLanguage(text);
    }

    const response = await sendMessage(ROUTES.REQUEST, {
      url: PAPAGO_API,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        deviceId: generateDeviceId(),
        locale: papagoTarget,
        dict: 'true',
        dictDisplay: '30',
        honorific: 'false',
        instant: 'false',
        paging: 'false',
        source: actualSource,
        target: papagoTarget,
        text: text,
      }).toString(),
    });

    if (!response || !response.ok || !response.data) {
      console.error('[Papago] 요청 실패:', response?.status);
      return { translatedText: text, detectedLang: '' };
    }

    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

    if (data.translatedText) {
      return {
        translatedText: data.translatedText,
        detectedLang: data.srcLangType || actualSource,
      };
    }

    return { translatedText: text, detectedLang: '' };
  } catch (err) {
    console.error('[Papago] 에러:', err);
    return { translatedText: text, detectedLang: '' };
  }
}

/**
 * 간단한 언어 감지 (첫 글자 유니코드 범위 기반)
 */
function detectLanguage(text) {
  const trimmed = text.trim();
  if (!trimmed) return 'en';

  const code = trimmed.charCodeAt(0);

  // 한글: U+AC00 ~ U+D7AF, U+1100 ~ U+11FF
  if ((code >= 0xAC00 && code <= 0xD7AF) || (code >= 0x1100 && code <= 0x11FF)) return 'ko';

  // 중국어: U+4E00 ~ U+9FFF
  if (code >= 0x4E00 && code <= 0x9FFF) return 'zh-CN';

  // 일본어: U+3040 ~ U+30FF (히라가나/카타카나)
  if (code >= 0x3040 && code <= 0x30FF) return 'ja';

  // 키릴 문자: U+0400 ~ U+04FF
  if (code >= 0x0400 && code <= 0x04FF) return 'ru';

  return 'en';
}

/**
 * 언어 코드를 Papago 형식으로 변환
 */
function mapLangCode(code) {
  const map = {
    'ko': 'ko',
    'en': 'en',
    'ja': 'ja',
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'zh': 'zh-CN',
    'ru': 'ru',
    'fr': 'fr',
    'de': 'de',
    'es': 'es',
    'it': 'it',
    'pt': 'pt',
    'vi': 'vi',
    'th': 'th',
    'id': 'id',
    'auto': 'auto',
  };
  return map[code] || code;
}

/**
 * Papago용 디바이스 ID 생성
 */
function generateDeviceId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      id += '-';
    } else {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return id;
}
