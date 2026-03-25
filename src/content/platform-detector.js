import { detectPlatform } from '../shared/platforms';

/**
 * Page type constants
 */
export const PAGE_TYPES = {
  ORDER_LIST: 'ORDER_LIST_PAGE',
  SHOPPING_CART: 'SHOPPING_CART_PAGE',
  PRODUCT_DETAILS: 'PRODUCT_DETAILS_PAGE',
  BUYER_PAGE: 'BUYER_PAGE',
  ADMIN_ORDER_DETAILS: 'ADMIN_ORDER_DETAILS_PAGE',
  ADMIN_DELIVERY_LIST: 'ADMIN_DELIVERY_LIST_PAGE',
  TRANSSHIP_APPLY: 'TRANSSHIP_APPLY_PAGE',
  TRANSSHIP_APPLIED_LIST: 'TRANSSHIP_APPLIED_LIST',
  BUY_APPLY: 'BUY_APPLY_PAGE',
  STOCK_APPLY: 'STOCK_APPLY_PAGE',
};

/**
 * Detect page type based on platform and URL
 */
export function detectPageType(platform, url) {
  if (!platform) return null;
  const pathname = new URL(url).pathname;

  switch (platform.name) {
    case 'taobao':
    case 'tmall':
      if (pathname.includes('list_bought_items')) return PAGE_TYPES.ORDER_LIST;
      if (pathname.includes('cart.htm')) return PAGE_TYPES.SHOPPING_CART;
      if (pathname.includes('item.htm')) return PAGE_TYPES.PRODUCT_DETAILS;
      break;

    case '1688':
      if (pathname.match(/\/offer\/\d+\.html/)) return PAGE_TYPES.PRODUCT_DETAILS;
      if (pathname.includes('buyer_order_list') || pathname.includes('buyer-order-list')) return PAGE_TYPES.ORDER_LIST;
      if (pathname.includes('cart.htm')) return PAGE_TYPES.SHOPPING_CART;
      break;

    case 'aliexpress':
      if (pathname.includes('/order/index')) return PAGE_TYPES.ORDER_LIST;
      if (pathname.includes('/item/')) return PAGE_TYPES.PRODUCT_DETAILS;
      break;

    case 'coupang':
      if (pathname.match(/\/vp\/products\/\d+/)) return PAGE_TYPES.PRODUCT_DETAILS;
      if (pathname.includes('delivery/management')) return PAGE_TYPES.ADMIN_DELIVERY_LIST;
      break;

    case 'navershopping':
      if (pathname.match(/\/products\/\d+/)) return PAGE_TYPES.PRODUCT_DETAILS;
      if (pathname.match(/\/catalog\/\d+/)) return PAGE_TYPES.PRODUCT_DETAILS;
      break;

    case 'gmarket':
      if (pathname.includes('/Item')) return PAGE_TYPES.PRODUCT_DETAILS;
      break;

    case 'auction':
      if (pathname.includes('ItemDetail')) return PAGE_TYPES.PRODUCT_DETAILS;
      break;
  }

  return null;
}
