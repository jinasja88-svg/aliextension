// AliPrice API base URLs
export const API_BASE = 'https://api.aliprice.com';
export const API_BASE_CN = 'https://api-cn.aliprice.com';
export const INDEX_BASE = 'https://index.aliprice.com';
export const WEB_BASE = 'https://www.aliprice.com';
export const AGENT_BASE = 'https://agent.aliprice.com';
export const CROSSBORDER_BASE = 'https://1688.aliprice.com';

// API endpoints
export const API = {
  // Popup
  CHECK_AL: '/index.php/chrome/popup/checkAl',
  EXT_ID_VER: '/index.php/chrome/popup/extIDver',
  PLUGIN_REDIRECT: '/index.php/chrome/popup/pluginRedirect',
  SET_PLUGIN_CLICK: '/index.php/chrome/popup/setPluginClick',
  SET_PLUGIN_USE: '/index.php/chrome/popup/setPluginUse',
  VERI_URL: '/index.php/chrome/popup/veriUrl',
  CHECK_IMG_SEARCH_STAT: '/index.php/chrome/popup/checkImgSearchStat',
  CHECK_FLOW_STAT: '/index.php/chrome/popup/checkFlowStat',
  GET_INFERENCE_MSG: '/index.php/chrome/popup/getInferenceMessage',
  EXT_WHITELIST: '/index.php/chrome/popup/extWhiteList',
  GET_RJSON: '/index.php/chrome/popup/getRJson',

  // Items
  IMAGE_UPLOAD: '/index.php/chrome/items/imageUpload',
  IMAGE_ANALYSIS: '/index.php/chrome/items/imageAnalysis',
  ADD_FAVORITE: '/index.php/chrome/items/addFavorite',
  DEL_FAVORITE: '/index.php/chrome/items/delFavorite',
  PRICE_TRACKING: '/index.php/chrome/items/priceTracking',
  HISTORY_TRACKING: '/index.php/chrome/Items/historyTracking',

  // Reviews
  GET_REVIEWS: '/index.php/chrome/reviews/getReviews',
  GET_SITE_REVIEWS: '/index.php/chrome/reviews/getSiteReviews',

  // Favorites
  IS_TIP_COUNT: '/index.php/chrome/favorites/isTipCount',
  SET_IS_TIP: '/index.php/chrome/favorites/setIsTip',

  // Translate
  SEARCH_TRANSFER_PAGE: '/index.php/chrome/translate/searchTransferPage',

  // Statistics
  STATISTICS_INDEX: '/index.php/chrome/statistics/Index',
  MAIN_INDEX: '/index.php/chrome/index/index',

  // Extension
  FEEDBACK: '/index.php/extension/feedback',
  UPDATE_LOG: '/index.php/extension/updatelog',
  CHECK_DATA: '/index.php/chrome/extension/checkData',
  SET_INFERENCE_COOKIE: '/index.php/chrome/extension/setInforenceCookie',
  CHECK_LINK: '/index.php/chrome/extension/checkLink',
  SET_INFERENCE_STATUS: '/index.php/chrome/extension/setInforenceStatus',

  // Recommendation
  RECOMMENDATION_BANNER: '/index.php/recommendation/banner/popup',

  // Currency (api-cn)
  CURRENCY: '/plugin/currency.php',
  UPDATE_PRICE: '/plugin/update_priceV2.php',
};

// Message routes
export const ROUTES = {
  // Background handlers
  REQUEST: 'backend/request',
  INJECT_SCRIPT: 'backend/inject/script',
  INJECT_STYLE: 'backend/inject/style',
  TAB_CREATE: 'backend/tab/create',
  TAB_REMOVE: 'backend/tab/remove',
  TAB_QUERY: 'backend/tab/query',
  TAB_QUERY_ACTIVE: 'backend/tab/query/active',
  TAB_MESSAGE: 'backend/tab/message',
  TAB_SCREENSHOT: 'backend/tab/screenshot',
  WINDOW_CREATE: 'backend/window/create',
  COOKIES_SET: 'backend/cookies/set',
  COOKIES_GET: 'backend/cookies/get',
  COOKIES_GET_ALL: 'backend/cookies/get_all',
  COOKIES_REMOVE: 'backend/cookies/remove',
  COOKIES_REMOVE_ALL: 'backend/cookies/remove_all',
  FETCH_FILE_DATAURL: 'backend/fetch_file_as_dataURL',
  UPLOAD_PROXY: 'backend/upload_proxy',
  UPLOAD_IMAGE: 'backend/upload_image',
  IMAGE_ANALYSIS: 'backend/image_analysis',
  DOWNLOAD: 'backend/download',
  DOWNLOAD_VIDEO: 'backend/download_video',
  ENCRYPT: 'backend/encrypt',
  PERMISSIONS_CONTAINS: 'backend/permissions/contains',
  PERMISSIONS_REQUEST: 'backend/permissions/request',
  PERMISSIONS_REMOVE: 'backend/permissions/remove',
  DNR_UPDATE: 'backend/declarative_net_request/ruleSet/update',
  VERSION_GET: 'backend/versionInfo/get',
  VERSION_CHECK: 'backend/versionInfo/check',
  TUTORIAL_URL: 'tutorial/getUrl',
  TUTORIAL_OPEN: 'tutorial/open',

  // Client routes (background -> content)
  OPEN_IMAGE_SEARCH: 'client/open_image_search',
  TRANSLATOR_PAGE: 'client/translator/page',
  TRANSLATOR_REMOVE: 'client/translator/remove',
  TRANSLATOR_SCREENSHOT: 'client/translator/screenshot',
  CAPTCHA_SHOW: 'client/captcha/show',
  CONTENT_RELOAD: 'client/content_script/reload',
  DESTROY: 'client/destroy',
  EXPORT_PANEL_OPEN: 'client/export_product_list/aside_panel/open',
  PRICE_SUB_OPEN: 'client/price_sub_modal/open',
  SETTINGS_OPEN: 'client/settings_modal/open',
  PRICE_DROP_CLEAR: 'client/price_drop/inbox/clear',
  PRICE_DROP_UPDATED: 'client/price_drop/inbox/updated',
};

// Alarm names
export const ALARMS = {
  SYNC_ALIPAPA_RULES: 'SYNC_ALIPAPA_RULES',
  CHECK_BULLETIN: 'CHECK_BULLETIN_MESSAGES',
  CHECK_VERSION: 'CHECK_VERSION_INFO',
  SYNC_SOURCE_RULES: 'SYNC_SOURCE_NOW_RULES',
  SYNC_EXCHANGE_RATE: 'SYNC_EXCHANGE_RATE',
  SET_INFERENCE_COOKIE: 'SET_INFORENCE_COOKIE',
  CHECK_HISTORY_MATCHES: 'CHECK_BROWSERING_HISTORY_MATCHES',
  REPORT_HISTORY: 'REPORT_BROWSERING_HISTORY',
  CLEAR_HISTORY: 'CLEAR_BROWSERING_HISTORY',
  CHECK_PRICE_DROP_INBOX: 'CHECK_PRICE_DROP_INBOX',
  CHECK_PRICE_DROP_NOTIFY: 'CHECK_PRICE_DROP_NOTIFY',
};

// Alarm intervals (in minutes)
export const ALARM_INTERVALS = {
  SYNC_ALIPAPA_RULES: 4320,       // 3 days
  CHECK_BULLETIN: 1440,            // 1 day
  CHECK_VERSION: 1440,             // 1 day
  SYNC_SOURCE_RULES: 10080,        // 7 days
  SYNC_EXCHANGE_RATE: 1440,        // 1 day
  SET_INFERENCE_COOKIE: 1440,      // 1 day
  CLEAR_HISTORY: 35,               // 35 min
};

// Storage keys
export const STORAGE_KEYS = {
  PERSISTENCE: '@@vwe-persistence',
  SESSION: 'sessionData',
  BROWSING_HISTORY: 'browsingHistory',
  PRICE_DROP_INBOX: 'priceDropInbox',
};

// Extension info
export const EXT_INFO = {
  ID: '10221',
  PLATFORM: 'taobao_search_by_image',
  VERSION: '1.0.0',
};
