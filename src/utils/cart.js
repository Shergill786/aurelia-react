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

/** Sum of price × quantity for every line. */
export function cartSubtotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/** Total number of items (used for the navbar badge). */
export function cartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

/**
 * Single source of truth for order totals. Cart, checkout and the saved
 * order all call this, so the numbers can never disagree.
 */
export function computeTotals(cart, couponCode = null) {
  const rate = COUPONS[couponCode] || 0;
  const subtotal = cartSubtotal(cart);
  const discount = subtotal * rate;
  const afterDiscount = subtotal - discount;
  const gst = afterDiscount * GST_RATE;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_COST;
  const total = afterDiscount + gst + shipping;
  return { subtotal, discount, gst, shipping, total, coupon: rate ? couponCode : null };
}
