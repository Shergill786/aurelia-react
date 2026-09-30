/**
 * format.js — small formatting helpers shared across components.
 */

/**
 * Format a number as Indian Rupees with Indian digit grouping.
 *   formatINR(8399)        -> "₹8,399"
 *   formatINR(12345.5, 2)  -> "₹12,345.50"
 * @param {number} amount
 * @param {number} [decimals] defaults to 0 for whole numbers, 2 otherwise
 */
export function formatINR(amount, decimals) {
  const digits = decimals ?? (Number.isInteger(amount) ? 0 : 2);
  return (
    '₹' +
    Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
  );
}

/** Percentage saved between the original and the sale price, e.g. 21. */
export function discountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}
