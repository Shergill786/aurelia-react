/**
 * cart.js — pure functions for cart maths.
 * Kept free of React so they are easy to test and reuse on any page.
 */

export const GST_RATE = 0.18;
export const FREE_SHIP_THRESHOLD = 4999;
export const SHIP_COST = 199;

/** Valid coupon codes and their discount rate. */
export const COUPONS = {
  AURELIA10: 0.1,
  WELCOME15: 0.15,
  GOLD20: 0.2,
};

/**
 * Build a stable key for a cart line so the same product in a different
 * size or colour becomes its own line: e.g. "1_size-M_color-0b0b0d".
 */
export function cartLineKey(id, options = {}) {
  const parts = Object.entries(options).map(([k, v]) => `${k}-${v}`);
  return [id, ...parts].join('_').replace(/[^\w-]/g, '');
}

/** Normalise mixed item shapes from the cart and saved orders. */
export function normalizeCart(items = []) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    const qtyValue = Number(item?.qty ?? item?.quantity ?? item?.count ?? 0);
    const priceValue = Number(item?.price ?? item?.unitPrice ?? 0);
    const qty = Number.isFinite(qtyValue) ? qtyValue : 0;
    const price = Number.isFinite(priceValue) ? priceValue : 0;

    return {
      ...item,
      id: item?.id ?? item?.productId ?? item?.product_id,
      key: item?.key ?? item?.dbId ?? item?.id ?? item?.productId ?? item?.product_id,
      name: item?.name ?? item?.productName ?? item?.product_name ?? 'Product',
      img: item?.img ?? item?.imageUrl ?? item?.image_url ?? '',
      price,
      qty,
      quantity: qty,
      options: item?.options ?? {},
    };
  });
}

/** Sum of price × quantity for every line. */
export function cartSubtotal(cart) {
  return normalizeCart(cart).reduce((sum, item) => sum + item.price * item.qty, 0);
}

/** Total number of items (used for the navbar badge). */
export function cartCount(cart) {
  return normalizeCart(cart).reduce((sum, item) => sum + item.qty, 0);
}

/**
 * Single source of truth for order totals. Cart, checkout and the saved
 * order all call this, so the numbers can never disagree.
 */
export function computeTotals(cart, couponCode = null) {
  const safeCart = normalizeCart(cart);
  const rate = COUPONS[couponCode] || 0;
  const subtotal = cartSubtotal(safeCart);
  const discount = subtotal * rate;
  const afterDiscount = subtotal - discount;
  const gst = afterDiscount * GST_RATE;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_COST;
  const total = afterDiscount + gst + shipping;
  return { subtotal, discount, gst, shipping, total, coupon: rate ? couponCode : null };
}
