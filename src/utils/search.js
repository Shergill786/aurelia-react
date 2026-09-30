/**
 * search.js — shared search matching for the navbar and the Shop page.
 * Case-insensitive match against name, brand, section, type and category.
 */
export function matchesSearch(product, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [product.name, product.brand, product.section, product.type, product.cat].some((field) =>
    field.toLowerCase().includes(q),
  );
}
