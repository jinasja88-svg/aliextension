import { translateText, translateBatch } from './google-translate';
import { translateWithPapago } from './papago';

/**
 * 통합 번역 함수
 * Google Translate 우선, 실패 시 Papago 폴백
 * @param {string} text
 * @param {string} targetLang
 * @param {string} sourceLang
 * @param {string} engine - 'auto' | 'google' | 'papago'
 */
export async function translate(text, targetLang = 'ko', sourceLang = 'auto', engine = 'auto') {
  if (!text || !text.trim()) return { translatedText: '', detectedLang: '', engine: '' };

  if (engine === 'papago') {
    const result = await translateWithPapago(text, targetLang, sourceLang);
    return { ...result, engine: 'papago' };
  }

  if (engine === 'google') {
    const result = await translateText(text, targetLang, sourceLang);
    return { ...result, engine: 'google' };
  }

  // auto: Google 먼저, 실패 시 Papago
  try {
    const result = await translateText(text, targetLang, sourceLang);
    if (result.translatedText && result.translatedText !== text) {
      return { ...result, engine: 'google' };
    }
  } catch (err) {
    console.warn('[Translator] Google 실패, Papago 시도:', err.message);
  }

  const result = await translateWithPapago(text, targetLang, sourceLang);
  return { ...result, engine: 'papago' };
}

export { translateText, translateBatch, translateWithPapago };
