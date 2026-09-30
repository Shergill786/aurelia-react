import { getProductById } from '../data/products';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { cartCount, cartLineKey, COUPONS, computeTotals } from '../utils/cart';
import { ShopContext, useToast } from './contexts';

/**
 * ShopProvider — everything the shopper builds up while browsing:
 * cart, wishlist, applied coupon and past orders.
 *
 * Each piece is React state (useState inside useLocalStorage), so any change
 * re-renders the components that use it — e.g. the navbar badge updates the
 * moment "Add to Cart" is clicked on a product card.
 */
export function ShopProvider({ children }) {
  const showToast = useToast();
  const [cart, setCart] = useLocalStorage('aurelia_cart', []);
  const [wishlist, setWishlist] = useLocalStorage('aurelia_wishlist', []);
  const [coupon, setCoupon] = useLocalStorage('aurelia_coupon', null);
  const [orders, setOrders] = useLocalStorage('aurelia_orders', []);

  /* ---------- Cart ---------- */
  const addToCart = (id, qty = 1, options = {}) => {
    const product = getProductById(id);
    if (!product) return;
    const key = cartLineKey(id, options);
    setCart((current) => {
      const existing = current.find((line) => line.key === key);
      if (existing) {
        return current.map((line) => (line.key === key ? { ...line, qty: line.qty + qty } : line));
      }
      const { name, img, price, oldPrice } = product;
      return [...current, { key, id, name, img, price, oldPrice, qty, options }];
    });
    showToast(`Added to cart — ${product.name}`, 'cart');
  };

  const changeQty = (key, delta) =>
    setCart((current) =>
      current.map((line) => (line.key === key ? { ...line, qty: Math.max(1, line.qty + delta) } : line)),
    );

  const removeFromCart = (key) => {
    setCart((current) => current.filter((line) => line.key !== key));
    showToast('Item removed from cart');
  };

  /* ---------- Wishlist ---------- */
  const isWishlisted = (id) => wishlist.includes(id);

  const toggleWishlist = (id) => {
    const adding = !wishlist.includes(id);
    setWishlist((current) => (adding ? [...current, id] : current.filter((w) => w !== id)));
    showToast(adding ? 'Added to wishlist' : 'Removed from wishlist', 'heart');
  };

  /* ---------- Coupon ---------- */
  /** Returns true when the code is valid (and applies it). */
  const applyCoupon = (rawCode) => {
    const code = rawCode.trim().toUpperCase();
    if (COUPONS[code]) {
      setCoupon(code);
      return true;
    }
    setCoupon(null);
    return false;
  };

  /* ---------- Orders ---------- */
  const placeOrder = (shipTo, payment) => {
    if (cart.length === 0) return null; // never create an empty order
    const totals = computeTotals(cart, coupon);
    const order = {
      id: 'AUR' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-IN'),
      items: cart,
      total: totals.total,
      coupon: totals.coupon,
      payment,
      shipTo,
      status: 'processing',
    };
    setOrders((current) => [order, ...current]);
    setCart([]);
    setCoupon(null);
    return order;
  };

  const value = {
    cart,
    cartCount: cartCount(cart),
    totals: computeTotals(cart, coupon),
    coupon,
    addToCart,
    changeQty,
    removeFromCart,
    wishlist,
    isWishlisted,
    toggleWishlist,
    applyCoupon,
    orders,
    placeOrder,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

