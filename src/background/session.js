import browser from 'webextension-polyfill';
import { STORAGE_KEYS } from '../shared/constants';

function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create new session
 */
export async function createSession() {
  const session = {
    sessionId: generateSessionId(),
    timestamp: Date.now(),
  };

  await browser.storage.session.set({
    [STORAGE_KEYS.SESSION]: session,
  });

  return session;
}

/**
 * Get current session (create if none exists)
 */
export async function getSession() {
  try {
    const result = await browser.storage.session.get(STORAGE_KEYS.SESSION);
    const session = result[STORAGE_KEYS.SESSION];

    if (session && session.sessionId) {
      return session;
    }
  } catch (err) {
    // storage.session may not be available
    console.warn('[Session] storage.session not available:', err.message);
  }

  return createSession();
}

/**
 * Check if session is valid (not expired)
 */
export async function isSessionValid(expiryMinutes = 30) {
  const session = await getSession();
  const elapsed = (Date.now() - session.timestamp) / 1000 / 60;
  return elapsed < expiryMinutes;
}
