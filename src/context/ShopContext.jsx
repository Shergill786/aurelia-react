import { useCallback, useEffect, useRef, useState } from 'react';

import { getProductById } from '../data/products';
import { useLocalStorage } from '../hooks/useLocalStorage';

import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../utils/api';

import {
  cartCount,
  cartLineKey,
  COUPONS,
  computeTotals,
} from '../utils/cart';

import { ShopContext, useAuth, useToast } from './contexts';


// --------------------------------
// HELPERS
// --------------------------------

/** Turn one row from the server's cart_items table into a cart line. */
function toCartLine(item) {
  const product = getProductById(item.product_id);

  return {
    key: item.cart_key || cartLineKey(item.product_id, {}),
    dbId: item.id,
    id: item.product_id,
    name: item.product_name || product?.name || 'Product',
    img: item.image_url || product?.img || '',
    price: Number(item.price) || product?.price || 0,
    oldPrice: product?.oldPrice || Number(item.price) || 0,
    qty: Number(item.quantity) || 1,
    options: item.options || {},
  };
}

/** Load a user's cart from the server, already converted to cart lines. */
async function fetchCartLines(userId) {
  const data = await getCart(userId);
  const items = Array.isArray(data) ? data : data.cart || data.items || [];
  return items.map(toCartLine);
}

/** The body the server expects for POST /api/cart. */
function toCartItemBody(userId, productId, qty, options) {
  const product = getProductById(productId);
  return {
    userId,
    productId,
    productName: product.name,
    price: product.price,
    imageUrl: product.img,
    quantity: qty,
    cartKey: cartLineKey(productId, options),
    options,
  };
}


/**
 * ShopProvider — cart, wishlist, coupon and orders.
 *
 * Guests: the cart lives in localStorage.
 * Signed in: the cart lives in the database (via the API). Anything a guest
 * added before signing in is moved into their account cart on login.
 */
export function ShopProvider({ children }) {
  const showToast = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  // --------------------------------
  // LOCAL DATA
  // --------------------------------

  const [localCart, setLocalCart] = useLocalStorage('aurelia_cart', []);
  const [wishlist, setWishlist] = useLocalStorage('aurelia_wishlist', []);
  const [coupon, setCoupon] = useLocalStorage('aurelia_coupon', null);
  const [orders, setOrders] = useLocalStorage('aurelia_orders', []);

  // --------------------------------
  // DATABASE CART
  // `owner` records whose cart `items` is, so after switching accounts we
  // never show the previous user's items while the new cart loads.
  // --------------------------------

  const [dbCart, setDbCart] = useState({ owner: null, items: [] });
  const [cartLoading, setCartLoading] = useState(false);

  const setDbItems = useCallback(
    (update) =>
      setDbCart((current) => ({
        owner: current.owner,
        items: typeof update === 'function' ? update(current.items) : update,
      })),
    [],
  );

  // The latest guest cart, readable inside the login effect without
  // re-running that effect every time the guest cart changes.
  const localCartRef = useRef(localCart);
  useEffect(() => {
    localCartRef.current = localCart;
  });

  // Which user the guest cart was already moved for. A ref survives React
  // StrictMode's double effect run in development, so items upload only once.
  const mergedForRef = useRef(null);


  // --------------------------------
  // LOAD CART WHEN USER LOGS IN
  // (and move the guest cart into the account)
  // --------------------------------

  useEffect(() => {
    if (!userId) {
      mergedForRef.current = null;
      return undefined;
    }

    let cancelled = false;

    const loadCart = async () => {
      setCartLoading(true);
      // Move the guest cart into the account once per sign-in.
      const guestItems = mergedForRef.current === userId ? [] : localCartRef.current;
      mergedForRef.current = userId;
      if (guestItems.length > 0) setLocalCart([]);

      try {
        for (let i = 0; i < guestItems.length; i++) {
          const line = guestItems[i];
          try {
            await addCartItem(toCartItemBody(userId, line.id, line.qty, line.options || {}));
          } catch (error) {
            // Keep whatever could not be saved in the guest cart.
            setLocalCart(guestItems.slice(i));
            throw error;
          }
        }
        if (guestItems.length > 0 && !cancelled) {
          showToast('Your cart items were saved to your account', 'cart');
        }

        const lines = await fetchCartLines(userId);
        if (!cancelled) setDbCart({ owner: userId, items: lines });
      } catch (error) {
        console.error('Could not load database cart:', error);
        if (!cancelled && error.status !== 401 && error.status !== 403) {
          showToast(error.message || 'Could not load your cart', 'error');
        }
      } finally {
        if (!cancelled) setCartLoading(false);
      }
    };

    loadCart();

    return () => {
      cancelled = true;
    };
  }, [userId, setLocalCart, showToast]);


  // --------------------------------
  // CURRENT CART
  // --------------------------------

  const cart = userId
    ? dbCart.owner === userId
      ? dbCart.items
      : []
    : localCart;


  // --------------------------------
  // ADD TO CART
  // --------------------------------

  const addToCart = async (id, qty = 1, options = {}) => {
    const product = getProductById(id);
    if (!product) return;

    // Signed in: save to the database, then reload the cart from it.
    if (userId) {
      try {
        await addCartItem(toCartItemBody(userId, id, qty, options));
        const lines = await fetchCartLines(userId);
        setDbCart({ owner: userId, items: lines });
        showToast(`Added to cart — ${product.name}`, 'cart');
      } catch (error) {
        console.error('Could not add item:', error);
        showToast(error.message || 'Could not add item to cart', 'error');
      }
      return;
    }

    // Guest: keep the cart in localStorage.
    const key = cartLineKey(id, options);

    setLocalCart((current) => {
      const existing = current.find((line) => line.key === key);

      if (existing) {
        return current.map((line) =>
          line.key === key ? { ...line, qty: line.qty + qty } : line,
        );
      }

      const { name, img, price, oldPrice } = product;
      return [...current, { key, id, name, img, price, oldPrice, qty, options }];
    });

    showToast(`Added to cart — ${product.name}`, 'cart');
  };


  // --------------------------------
  // CHANGE QUANTITY
  // --------------------------------

  const changeQty = async (key, delta) => {
    if (userId) {
      const item = cart.find((line) => line.key === key);
      if (!item) return;

      const newQuantity = Math.max(1, item.qty + delta);

      try {
        await updateCartItem(item.dbId, newQuantity);
        setDbItems((items) =>
          items.map((line) => (line.key === key ? { ...line, qty: newQuantity } : line)),
        );
      } catch (error) {
        console.error('Could not update cart:', error);
        showToast(error.message || 'Could not update cart', 'error');
      }
      return;
    }

    setLocalCart((current) =>
      current.map((line) =>
        line.key === key ? { ...line, qty: Math.max(1, line.qty + delta) } : line,
      ),
    );
  };


  // --------------------------------
  // REMOVE FROM CART
  // --------------------------------

  const removeFromCart = async (key) => {
    if (userId) {
      const item = cart.find((line) => line.key === key);
      if (!item) return;

      try {
        await removeCartItem(item.dbId);
        setDbItems((items) => items.filter((line) => line.key !== key));
        showToast('Item removed from cart');
      } catch (error) {
        console.error('Could not remove item:', error);
        showToast(error.message || 'Could not remove item', 'error');
      }
      return;
    }

    setLocalCart((current) => current.filter((line) => line.key !== key));
    showToast('Item removed from cart');
  };


  // --------------------------------
  // WISHLIST
  // --------------------------------

  const isWishlisted = (id) => wishlist.includes(id);

  const toggleWishlist = (id) => {
    const adding = !wishlist.includes(id);

    setWishlist((current) => (adding ? [...current, id] : current.filter((w) => w !== id)));

    showToast(adding ? 'Added to wishlist' : 'Removed from wishlist', 'heart');
  };


  // --------------------------------
  // COUPON
  // --------------------------------

  const applyCoupon = (rawCode) => {
    const code = rawCode.trim().toUpperCase();

    if (COUPONS[code]) {
      setCoupon(code);
      return true;
    }

    setCoupon(null);
    return false;
  };


  // --------------------------------
  // PLACE ORDER
  // --------------------------------

  const placeOrder = (shipTo, payment) => {
    if (cart.length === 0) return null;

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

    if (userId) {
      // Empty the cart on screen straight away, then in the database.
      setDbItems([]);
      clearCart(userId).catch((error) => {
        console.error('Could not clear database cart:', error);
      });
    } else {
      setLocalCart([]);
    }

    setCoupon(null);

    return order;
  };


  // --------------------------------
  // CONTEXT VALUE
  // --------------------------------

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
    cartLoading,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}