/**
 * Platform definitions for content script detection
 * Each entry: { name, domains (array of hostname patterns), type }
 */
export const PLATFORMS = [
  // Chinese platforms
  { name: '1688', domains: ['1688.com', 'world.1688.com'], type: 'chinese' },
  { name: 'taobao', domains: ['taobao.com', 'world.taobao.com'], type: 'chinese' },
  { name: 'tmall', domains: ['tmall.com', 'tmall.hk'], type: 'chinese' },
  { name: 'jd', domains: ['jd.com', 'jd.hk'], type: 'chinese' },
  { name: 'pinduoduo', domains: ['yangkeduo.com', 'pinduoduo.com', 'pifa.pinduoduo.com'], type: 'chinese' },
  { name: 'aliexpress', domains: ['aliexpress.com', 'aliexpress.ru', 'aliexpress.us'], type: 'chinese' },
  { name: 'alibaba', domains: ['alibaba.com'], type: 'chinese' },
  { name: 'goofish', domains: ['goofish.com'], type: 'chinese' },
  { name: 'douyin', domains: ['haohuo.jinritemai.com'], type: 'chinese' },
  { name: 'vvic', domains: ['vvic.com'], type: 'chinese' },
  { name: '17zwd', domains: ['17zwd.com', 'gz.17zwd.com'], type: 'chinese' },
  { name: 'chinagoods', domains: ['chinagoods.com'], type: 'chinese' },
  { name: 'yiwugo', domains: ['yiwugo.com'], type: 'chinese' },
  { name: 'zhaojiafang', domains: ['zhaojiafang.com'], type: 'chinese' },
  { name: 'sooxie', domains: ['sooxie.com'], type: 'chinese' },
  { name: 'wsy', domains: ['wsy.com'], type: 'chinese' },
  { name: 'bao66', domains: ['bao66.cn'], type: 'chinese' },
  { name: '51taoyang', domains: ['51taoyang.com'], type: 'chinese' },
  { name: 'hznzcn', domains: ['hznzcn.com'], type: 'chinese' },
  { name: 'yunchepin', domains: ['yunchepin.cn'], type: 'chinese' },
  { name: '3e3e', domains: ['3e3e.com'], type: 'chinese' },
  { name: 'madeinchina', domains: ['made-in-china.com'], type: 'chinese' },

  // Korean platforms
  { name: 'coupang', domains: ['coupang.com'], type: 'korean' },
  { name: 'gmarket', domains: ['gmarket.co.kr', 'global.gmarket.co.kr'], type: 'korean' },
  { name: '11st', domains: ['11st.co.kr'], type: 'korean' },
  { name: 'auction', domains: ['auction.co.kr'], type: 'korean' },
  { name: 'ssg', domains: ['ssg.com'], type: 'korean' },
  { name: 'lotteon', domains: ['lotteon.com'], type: 'korean' },
  { name: 'lotteimall', domains: ['lotteimall.com'], type: 'korean' },
  { name: 'tmon', domains: ['tmon.co.kr'], type: 'korean' },
  { name: 'interpark', domains: ['interpark.com', 'shop.interpark.com'], type: 'korean' },
  { name: 'kurly', domains: ['kurly.com'], type: 'korean' },
  { name: 'enuri', domains: ['enuri.com'], type: 'korean' },
  { name: 'yes24', domains: ['yes24.com'], type: 'korean' },
  { name: 'oliveyoung', domains: ['oliveyoung.co.kr'], type: 'korean' },
  { name: 'domeggook', domains: ['domeggook.com'], type: 'korean' },
  { name: 'ownerclan', domains: ['ownerclan.com'], type: 'korean' },
  { name: 'navershopping', domains: ['shopping.naver.com', 'brand.naver.com', 'smartstore.naver.com'], type: 'korean' },
  { name: 'ohou', domains: ['ohou.se'], type: 'korean' },
  { name: 'wadiz', domains: ['wadiz.kr'], type: 'korean' },
  { name: 'gsshop', domains: ['gsshop.com'], type: 'korean' },
  { name: 'cjonstyle', domains: ['cjonstyle.com'], type: 'korean' },
  { name: 'skstoa', domains: ['skstoa.com'], type: 'korean' },
  { name: '1300k', domains: ['1300k.com'], type: 'korean' },

  // Japanese platforms
  { name: 'rakuten', domains: ['rakuten.co.jp'], type: 'japanese' },
  { name: 'amazon_jp', domains: ['amazon.co.jp'], type: 'japanese' },
  { name: 'mercari', domains: ['mercari.com', 'jp.mercari.com'], type: 'japanese' },
  { name: 'yahoo_shopping_jp', domains: ['shopping.yahoo.co.jp'], type: 'japanese' },
  { name: 'zozo', domains: ['zozo.jp'], type: 'japanese' },

  // Global platforms
  { name: 'amazon', domains: ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.es', 'amazon.it', 'amazon.in', 'amazon.com.au', 'amazon.ca', 'amazon.com.br', 'amazon.com.mx', 'amazon.ae', 'amazon.sa', 'amazon.nl', 'amazon.pl', 'amazon.se', 'amazon.sg', 'amazon.eg', 'amazon.com.tr'], type: 'global' },
  { name: 'ebay', domains: ['ebay.com', 'ebay.co.uk', 'ebay.de', 'ebay.fr', 'ebay.it', 'ebay.es', 'ebay.com.au'], type: 'global' },
  { name: 'walmart', domains: ['walmart.com'], type: 'global' },
  { name: 'etsy', domains: ['etsy.com'], type: 'global' },
  { name: 'shein', domains: ['shein.com', 'm.shein.com'], type: 'global' },
  { name: 'temu', domains: ['temu.com'], type: 'global' },
  { name: 'tiktokshop', domains: ['tiktok.com'], type: 'global' },
  { name: 'shopee', domains: ['shopee.sg', 'shopee.co.th', 'shopee.co.id', 'shopee.com.my', 'shopee.ph', 'shopee.vn', 'shopee.com.br', 'shopee.com.co', 'shopee.cl', 'shopee.com.mx', 'shopee.tw'], type: 'global' },
  { name: 'lazada', domains: ['lazada.co.id', 'lazada.co.th', 'lazada.com.my', 'lazada.com.ph', 'lazada.sg', 'lazada.vn'], type: 'global' },

  // European/Russian
  { name: 'wildberries', domains: ['wildberries.ru', 'wildberries.by', 'wildberries.kg', 'wildberries.kz', 'wildberries.uz', 'wildberries.co.il', 'wildberries.am'], type: 'european' },
  { name: 'ozon', domains: ['ozon.ru'], type: 'european' },
  { name: 'allegro', domains: ['allegro.pl'], type: 'european' },

  // Southeast Asian
  { name: 'tokopedia', domains: ['tokopedia.com'], type: 'southeast_asian' },
  { name: 'bukalapak', domains: ['bukalapak.com'], type: 'southeast_asian' },
];

/**
 * Image search target platforms (29 total)
 */
export const IMAGE_SEARCH_PLATFORMS = [
  { id: 'alibabaCN', name: '1688', baseUrl: 'https://1688.com', icon: '1688' },
  { id: 'alibabaCNKuaJing', name: '1688 Global', baseUrl: 'https://global.1688.com', icon: '1688' },
  { id: 'taobao', name: 'Taobao', baseUrl: 'https://taobao.com', icon: 'taobao' },
  { id: 'aliexpress', name: 'AliExpress', baseUrl: 'https://aliexpress.com', icon: 'aliexpress' },
  { id: 'alibaba', name: 'Alibaba', baseUrl: 'https://alibaba.com', icon: 'alibaba' },
  { id: 'joybuy', name: 'JD.com', baseUrl: 'https://jd.com', icon: 'jd' },
  { id: 'pinduoduo', name: 'Pinduoduo', baseUrl: 'https://mobile.yangkeduo.com', icon: 'pdd' },
  { id: 'pinduoduoPifa', name: 'PDD Pifa', baseUrl: 'https://pifa.pinduoduo.com', icon: 'pdd' },
  { id: 'yiwugo', name: 'Yiwugo', baseUrl: 'https://yiwugo.com', icon: 'yiwugo' },
  { id: 'wildberries', name: 'Wildberries', baseUrl: 'https://wildberries.ru', icon: 'wb' },
  { id: 'naverShopping', name: 'Naver Shopping', baseUrl: 'https://shopping.naver.com', icon: 'naver' },
  { id: 'amazon', name: 'Amazon', baseUrl: 'https://amazon.com', icon: 'amazon' },
  { id: 'vvic', name: 'VVIC', baseUrl: 'https://www.vvic.com', icon: 'vvic' },
  { id: 'googleLens', name: 'Google Lens', baseUrl: 'https://images.google.com', icon: 'google' },
  { id: 'bingLens', name: 'Bing', baseUrl: 'https://www.bing.com/images', icon: 'bing' },
  { id: 'baiduLens', name: 'Baidu', baseUrl: 'https://graph.baidu.com', icon: 'baidu' },
  { id: 'hznzcn', name: 'Hznzcn', baseUrl: 'https://www.hznzcn.com', icon: 'hznzcn' },
  { id: 'wsy', name: 'Wsy', baseUrl: 'https://wsy.com', icon: 'wsy' },
  { id: '17zwd', name: '17zwd', baseUrl: 'https://gz.17zwd.com', icon: '17zwd' },
  { id: 'sooxie', name: 'Sooxie', baseUrl: 'https://sooxie.com', icon: 'sooxie' },
  { id: '51taoyang', name: '51taoyang', baseUrl: 'https://www.51taoyang.com', icon: '51taoyang' },
  { id: 'bao66', name: 'Bao66', baseUrl: 'https://www.bao66.cn', icon: 'bao66' },
  { id: 'chinagoods', name: 'Chinagoods', baseUrl: 'https://chinagoods.com', icon: 'chinagoods' },
  { id: 'zhaojiafang', name: 'Zhaojiafang', baseUrl: 'https://www.zhaojiafang.com', icon: 'zhaojiafang' },
  { id: 'shein', name: 'Shein', baseUrl: 'https://shein.com', icon: 'shein' },
  { id: 'yandex', name: 'Yandex', baseUrl: 'https://yandex.com/images', icon: 'yandex' },
  { id: 'madeInChina', name: 'Made-in-China', baseUrl: 'https://made-in-china.com', icon: 'mic' },
  { id: 'mercari', name: 'Mercari', baseUrl: 'https://jp.mercari.com', icon: 'mercari' },
  { id: 'alipriceOwnerclan', name: 'AliPrice', baseUrl: 'https://aliprice.com', icon: 'aliprice' },
];

/**
 * Detect current platform from hostname
 */
export function detectPlatform(hostname) {
  const host = hostname.toLowerCase();
  for (const platform of PLATFORMS) {
    for (const domain of platform.domains) {
      if (host === domain || host.endsWith('.' + domain)) {
        return platform;
      }
    }
  }
  return null;
}
