import { useEffect, useState } from 'react';

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

import { ShopContext, useToast } from './contexts';
import { useAuth } from './AuthContext';


export function ShopProvider({ children }) {
  const showToast = useToast();
  const { user } = useAuth();

  // --------------------------------
  // LOCAL DATA
  // --------------------------------

  const [localCart, setLocalCart] = useLocalStorage(
    'aurelia_cart',
    []
  );

  const [wishlist, setWishlist] = useLocalStorage(
    'aurelia_wishlist',
    []
  );

  const [coupon, setCoupon] = useLocalStorage(
    'aurelia_coupon',
    null
  );

  const [orders, setOrders] = useLocalStorage(
    'aurelia_orders',
    []
  );


  // --------------------------------
  // DATABASE CART
  // --------------------------------

  const [dbCart, setDbCart] = useState([]);

  const [cartLoading, setCartLoading] = useState(false);


  // --------------------------------
  // LOAD CART WHEN USER LOGS IN
  // --------------------------------

  useEffect(() => {
    if (!user?.id) {
      setDbCart([]);
      return;
    }

    const loadCart = async () => {
      try {
        setCartLoading(true);

        const data = await getCart(user.id);

        const items = Array.isArray(data)
          ? data
          : data.cart || data.items || [];

        const formattedCart = items.map((item) => {
          const product = getProductById(
            item.product_id
          );

          return {
            key:
              item.cart_key ||
              cartLineKey(item.product_id, {}),

            dbId: item.id,

            id: item.product_id,

            name:
              item.product_name ||
              product?.name ||
              'Product',

            img:
              item.image_url ||
              product?.img ||
              '',

            price:
              Number(item.price) ||
              product?.price ||
              0,

            oldPrice:
              product?.oldPrice ||
              Number(item.price) ||
              0,

            qty:
              Number(item.quantity) || 1,

            options: item.options || {},
          };
        });

        setDbCart(formattedCart);

      } catch (error) {
        console.error(
          'Could not load database cart:',
          error
        );

        showToast(
          'Could not load your cart',
          'error'
        );

      } finally {
        setCartLoading(false);
      }
    };

    loadCart();

  }, [user?.id]);


  // --------------------------------
  // CURRENT CART
  // --------------------------------

  const cart = user?.id
    ? dbCart
    : localCart;


  // --------------------------------
  // ADD TO CART
  // --------------------------------

  const addToCart = async (
    id,
    qty = 1,
    options = {}
  ) => {
    const product = getProductById(id);

    if (!product) return;


    // USER LOGGED IN
    // Save to DATABASE
    if (user?.id) {
      try {

        const key = cartLineKey(
          id,
          options
        );

        await addCartItem({
          userId: user.id,

          productId: id,

          productName: product.name,

          price: product.price,

          imageUrl: product.img,

          quantity: qty,

          cartKey: key,

          options,
        });


        // Reload database cart
        const data = await getCart(user.id);

        const items = Array.isArray(data)
          ? data
          : data.cart || data.items || [];

        const formattedCart = items.map(
          (item) => {
            const dbProduct =
              getProductById(
                item.product_id
              );

            return {
              key:
                item.cart_key ||
                cartLineKey(
                  item.product_id,
                  {}
                ),

              dbId: item.id,

              id: item.product_id,

              name:
                item.product_name ||
                dbProduct?.name ||
                'Product',

              img:
                item.image_url ||
                dbProduct?.img ||
                '',

              price:
                Number(item.price) ||
                dbProduct?.price ||
                0,

              oldPrice:
                dbProduct?.oldPrice ||
                Number(item.price) ||
                0,

              qty:
                Number(item.quantity) || 1,

              options:
                item.options || {},
            };
          }
        );

        setDbCart(formattedCart);

        showToast(
          `Added to cart — ${product.name}`,
          'cart'
        );

      } catch (error) {
        console.error(
          'Could not add item:',
          error
        );

        showToast(
          error.message ||
            'Could not add item to cart',
          'error'
        );
      }

      return;
    }


    // --------------------------------
    // GUEST USER
    // Keep existing localStorage logic
    // --------------------------------

    const key = cartLineKey(
      id,
      options
    );

    setLocalCart((current) => {

      const existing = current.find(
        (line) => line.key === key
      );

      if (existing) {
        return current.map((line) =>
          line.key === key
            ? {
                ...line,
                qty: line.qty + qty,
              }
            : line
        );
      }

      const {
        name,
        img,
        price,
        oldPrice,
      } = product;

      return [
        ...current,
        {
          key,
          id,
          name,
          img,
          price,
          oldPrice,
          qty,
          options,
        },
      ];
    });

    showToast(
      `Added to cart — ${product.name}`,
      'cart'
    );
  };


  // --------------------------------
  // CHANGE QUANTITY
  // --------------------------------

  const changeQty = async (
    key,
    delta
  ) => {

    // DATABASE CART
    if (user?.id) {

      const item = dbCart.find(
        (line) => line.key === key
      );

      if (!item) return;

      const newQuantity = Math.max(
        1,
        item.qty + delta
      );

      try {

        await updateCartItem(
          item.dbId,
          newQuantity
        );

        setDbCart((current) =>
          current.map((line) =>
            line.key === key
              ? {
                  ...line,
                  qty: newQuantity,
                }
              : line
          )
        );

      } catch (error) {
        console.error(
          'Could not update cart:',
          error
        );

        showToast(
          error.message ||
            'Could not update cart',
          'error'
        );
      }

      return;
    }


    // LOCAL CART
    setLocalCart((current) =>
      current.map((line) =>
        line.key === key
          ? {
              ...line,
              qty: Math.max(
                1,
                line.qty + delta
              ),
            }
          : line
      )
    );
  };


  // --------------------------------
  // REMOVE FROM CART
  // --------------------------------

  const removeFromCart = async (
    key
  ) => {

    // DATABASE CART
    if (user?.id) {

      const item = dbCart.find(
        (line) => line.key === key
      );

      if (!item) return;

      try {

        await removeCartItem(
          item.dbId
        );

        setDbCart((current) =>
          current.filter(
            (line) =>
              line.key !== key
          )
        );

        showToast(
          'Item removed from cart'
        );

      } catch (error) {
        console.error(
          'Could not remove item:',
          error
        );

        showToast(
          error.message ||
            'Could not remove item',
          'error'
        );
      }

      return;
    }


    // LOCAL CART
    setLocalCart((current) =>
      current.filter(
        (line) => line.key !== key
      )
    );

    showToast(
      'Item removed from cart'
    );
  };


  // --------------------------------
  // WISHLIST
  // --------------------------------

  const isWishlisted = (id) =>
    wishlist.includes(id);


  const toggleWishlist = (id) => {

    const adding =
      !wishlist.includes(id);

    setWishlist((current) =>
      adding
        ? [...current, id]
        : current.filter(
            (w) => w !== id
          )
    );

    showToast(
      adding
        ? 'Added to wishlist'
        : 'Removed from wishlist',
      'heart'
    );
  };


  // --------------------------------
  // COUPON
  // --------------------------------

  const applyCoupon = (rawCode) => {

    const code = rawCode
      .trim()
      .toUpperCase();

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

  const placeOrder = (
    shipTo,
    payment
  ) => {

    if (cart.length === 0) {
      return null;
    }

    const totals =
      computeTotals(
        cart,
        coupon
      );

    const order = {
      id:
        'AUR' +
        Math.floor(
          100000 +
            Math.random() *
              900000
        ),

      date:
        new Date().toLocaleDateString(
          'en-IN'
        ),

      items: cart,

      total: totals.total,

      coupon: totals.coupon,

      payment,

      shipTo,

      status: 'processing',
    };


    setOrders((current) => [
      order,
      ...current,
    ]);


    // Clear database cart
    if (user?.id) {

      clearCart(user.id)
        .then(() => {
          setDbCart([]);
        })
        .catch((error) => {
          console.error(
            'Could not clear database cart:',
            error
          );
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

    cartCount:
      cartCount(cart),

    totals:
      computeTotals(
        cart,
        coupon
      ),

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


  return (
    <ShopContext.Provider
      value={value}
    >
      {children}
    </ShopContext.Provider>
  );
}