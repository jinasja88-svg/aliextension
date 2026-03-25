import browser from 'webextension-polyfill';
import { ALARMS, ALARM_INTERVALS } from '../shared/constants';

/**
 * Create alarm only if it doesn't exist
 */
async function ensureAlarm(name, options) {
  const existing = await browser.alarms.get(name);
  if (!existing) {
    browser.alarms.create(name, options);
  }
}

/**
 * Initialize all scheduled alarms
 */
export function initAlarms() {
  // 3-day interval alarms
  ensureAlarm(ALARMS.SYNC_ALIPAPA_RULES, {
    delayInMinutes: 1,
    periodInMinutes: ALARM_INTERVALS.SYNC_ALIPAPA_RULES,
  });

  // Daily alarms
  ensureAlarm(ALARMS.CHECK_BULLETIN, {
    delayInMinutes: 5,
    periodInMinutes: ALARM_INTERVALS.CHECK_BULLETIN,
  });

  ensureAlarm(ALARMS.CHECK_VERSION, {
    delayInMinutes: 10,
    periodInMinutes: ALARM_INTERVALS.CHECK_VERSION,
  });

  ensureAlarm(ALARMS.SYNC_EXCHANGE_RATE, {
    delayInMinutes: 2,
    periodInMinutes: ALARM_INTERVALS.SYNC_EXCHANGE_RATE,
  });

  ensureAlarm(ALARMS.SET_INFERENCE_COOKIE, {
    delayInMinutes: 3,
    periodInMinutes: ALARM_INTERVALS.SET_INFERENCE_COOKIE,
  });

  // Weekly alarm
  ensureAlarm(ALARMS.SYNC_SOURCE_RULES, {
    delayInMinutes: 15,
    periodInMinutes: ALARM_INTERVALS.SYNC_SOURCE_RULES,
  });

  // Short interval alarm
  ensureAlarm(ALARMS.CLEAR_HISTORY, {
    delayInMinutes: 35,
    periodInMinutes: ALARM_INTERVALS.CLEAR_HISTORY,
  });

  // Register alarm listener
  browser.alarms.onAlarm.addListener(handleAlarm);
}

/**
 * Alarm event dispatcher
 */
async function handleAlarm(alarm) {
  console.log(`[Alarm] Fired: ${alarm.name}`);

  switch (alarm.name) {
    case ALARMS.SYNC_ALIPAPA_RULES:
      // TODO: Fetch rules from AliPrice API
      console.log('[Alarm] Syncing AliPapa rules...');
      break;

    case ALARMS.CHECK_BULLETIN:
      // TODO: Query bulletin API
      console.log('[Alarm] Checking bulletin messages...');
      break;

    case ALARMS.CHECK_VERSION:
      // TODO: Check for extension updates
      console.log('[Alarm] Checking version info...');
      break;

    case ALARMS.SYNC_SOURCE_RULES:
      // TODO: Sync image search button rules
      console.log('[Alarm] Syncing source rules...');
      break;

    case ALARMS.SYNC_EXCHANGE_RATE:
      // TODO: Fetch exchange rates
      console.log('[Alarm] Syncing exchange rates...');
      break;

    case ALARMS.SET_INFERENCE_COOKIE:
      // TODO: Set tracking cookie
      console.log('[Alarm] Setting inference cookie...');
      break;

    case ALARMS.CLEAR_HISTORY:
      // TODO: Clear local browsing history
      console.log('[Alarm] Clearing browsing history...');
      break;

    case ALARMS.CHECK_HISTORY_MATCHES:
      console.log('[Alarm] Checking history matches...');
      break;

    case ALARMS.REPORT_HISTORY:
      console.log('[Alarm] Reporting browsing history...');
      break;

    case ALARMS.CHECK_PRICE_DROP_INBOX:
      console.log('[Alarm] Checking price drop inbox...');
      break;

    case ALARMS.CHECK_PRICE_DROP_NOTIFY:
      console.log('[Alarm] Checking price drop notifications...');
      break;

    default:
      console.warn(`[Alarm] Unknown alarm: ${alarm.name}`);
  }
}
