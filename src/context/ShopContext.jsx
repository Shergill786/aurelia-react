// src/context/ShopContext.jsx

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { getProductById } from '../data/products';
import { useLocalStorage } from '../hooks/useLocalStorage';

import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  getOrders,
  createOrder,
} from '../utils/api';

import {
  cartCount,
  cartLineKey,
  COUPONS,
  computeTotals,
} from '../utils/cart';

import {
  ShopContext,
  useAuth,
  useToast,
} from './contexts';


// --------------------------------
// HELPERS
// --------------------------------

/**
 * Turn one row from the server's cart_items
 * table into a frontend cart line.
 */
function toCartLine(item) {
  const product =
    getProductById(item.product_id);

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
      Number(item.quantity) ||
      1,

    options:
      item.options || {},
  };
}


/**
 * Load a user's cart from the server.
 */
async function fetchCartLines(userId) {
  const data =
    await getCart(userId);

  const items =
    Array.isArray(data)
      ? data
      : data.cart ||
        data.items ||
        [];

  return items.map(toCartLine);
}


/**
 * Body expected by POST /api/cart.
 */
function toCartItemBody(
  userId,
  productId,
  qty,
  options
) {
  const product =
    getProductById(productId);

  return {
    userId,

    productId,

    productName:
      product.name,

    price:
      product.price,

    imageUrl:
      product.img,

    quantity:
      qty,

    cartKey:
      cartLineKey(
        productId,
        options
      ),

    options,
  };
}


/**
 * Convert the response from GET /api/orders
 * into a safe frontend orders array.
 *
 * The backend already returns the frontend
 * structure, so this mainly handles the different
 * possible API response shapes.
 */
function extractOrders(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.orders)) {
    return data.orders;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}


// --------------------------------
// SHOP PROVIDER
// --------------------------------

/**
 * ShopProvider manages:
 *
 * - cart
 * - wishlist
 * - coupon
 * - orders
 *
 * Guests:
 *   Cart and orders use localStorage.
 *
 * Signed-in users:
 *   Cart and orders use the database through the API.
 */
export function ShopProvider({
  children,
}) {
  const showToast =
    useToast();

  const { user } =
    useAuth();

  const userId =
    user?.id;


  // --------------------------------
  // LOCAL DATA
  // --------------------------------

  const [
    localCart,
    setLocalCart,
  ] = useLocalStorage(
    'aurelia_cart',
    []
  );

  const [
    wishlist,
    setWishlist,
  ] = useLocalStorage(
    'aurelia_wishlist',
    []
  );

  const [
    coupon,
    setCoupon,
  ] = useLocalStorage(
    'aurelia_coupon',
    null
  );

  // Guest orders remain in localStorage.
  const [
    localOrders,
    setLocalOrders,
  ] = useLocalStorage(
    'aurelia_orders',
    []
  );


  // --------------------------------
  // DATABASE CART
  // --------------------------------

  const [
    dbCart,
    setDbCart,
  ] = useState({
    owner: null,
    items: [],
  });

  const [
    cartLoading,
    setCartLoading,
  ] = useState(false);


  // --------------------------------
  // DATABASE ORDERS
  // --------------------------------

  const [
    dbOrders,
    setDbOrders,
  ] = useState({
    owner: null,
    items: [],
  });

  const [
    ordersLoading,
    setOrdersLoading,
  ] = useState(false);


  // --------------------------------
  // DATABASE CART HELPER
  // --------------------------------

  const setDbItems =
    useCallback(
      (update) =>
        setDbCart(
          (current) => ({
            owner:
              current.owner,

            items:
              typeof update ===
              'function'
                ? update(
                    current.items
                  )
                : update,
          })
        ),
      []
    );


  // --------------------------------
  // KEEP LATEST GUEST CART
  // --------------------------------

  const localCartRef =
    useRef(localCart);

  useEffect(() => {
    localCartRef.current =
      localCart;
  }, [localCart]);


  // --------------------------------
  // PREVENT DOUBLE CART MERGE
  // --------------------------------

  const mergedForRef =
    useRef(null);


  // --------------------------------
  // LOAD CART WHEN USER LOGS IN
  // --------------------------------

  useEffect(() => {
    if (!userId) {
      mergedForRef.current =
        null;

      setDbCart({
        owner: null,
        items: [],
      });

      return undefined;
    }

    let cancelled = false;


    const loadCart =
      async () => {
        setCartLoading(true);


        // --------------------------------
        // Move guest cart into database
        // --------------------------------

        const guestItems =
          mergedForRef.current ===
          userId
            ? []
            : localCartRef.current;

        mergedForRef.current =
          userId;


        if (
          guestItems.length > 0
        ) {
          setLocalCart([]);
        }


        try {

          for (
            let i = 0;
            i < guestItems.length;
            i++
          ) {
            const line =
              guestItems[i];

            try {
              await addCartItem(
                toCartItemBody(
                  userId,
                  line.id,
                  line.qty,
                  line.options || {}
                )
              );
            } catch (error) {

              // Put unsaved items back
              // into guest cart.
              setLocalCart(
                guestItems.slice(i)
              );

              throw error;
            }
          }


          if (
            guestItems.length > 0 &&
            !cancelled
          ) {
            showToast(
              'Your cart items were saved to your account',
              'cart'
            );
          }


          // --------------------------------
          // Load database cart
          // --------------------------------

          const lines =
            await fetchCartLines(
              userId
            );

          if (!cancelled) {
            setDbCart({
              owner: userId,
              items: lines,
            });
          }

        } catch (error) {

          console.error(
            'Could not load database cart:',
            error
          );

          if (
            !cancelled &&
            error.status !== 401 &&
            error.status !== 403
          ) {
            showToast(
              error.message ||
                'Could not load your cart',
              'error'
            );
          }

        } finally {

          if (!cancelled) {
            setCartLoading(false);
          }
        }
      };


    loadCart();


    return () => {
      cancelled = true;
    };
  }, [
    userId,
    setLocalCart,
    showToast,
  ]);


  // --------------------------------
  // LOAD ORDERS WHEN USER LOGS IN
  // --------------------------------

  useEffect(() => {
    if (!userId) {
      setDbOrders({
        owner: null,
        items: [],
      });

      return undefined;
    }

    let cancelled = false;


    const loadOrders =
      async () => {
        setOrdersLoading(true);


        try {
          const data =
            await getOrders();

          const loadedOrders =
            extractOrders(data);


          if (!cancelled) {
            setDbOrders({
              owner: userId,
              items:
                loadedOrders,
            });
          }

        } catch (error) {

          console.error(
            'Could not load database orders:',
            error
          );

          if (
            !cancelled &&
            error.status !== 401 &&
            error.status !== 403
          ) {
            showToast(
              error.message ||
                'Could not load your orders',
              'error'
            );
          }

        } finally {

          if (!cancelled) {
            setOrdersLoading(false);
          }
        }
      };


    loadOrders();


    return () => {
      cancelled = true;
    };
  }, [
    userId,
    showToast,
  ]);


  // --------------------------------
  // CURRENT CART
  // --------------------------------

  const cart =
    userId
      ? dbCart.owner === userId
        ? dbCart.items
        : []
      : localCart;


  // --------------------------------
  // CURRENT ORDERS
  // --------------------------------

  const orders =
    userId
      ? dbOrders.owner === userId
        ? dbOrders.items
        : []
      : localOrders;


  // --------------------------------
  // ADD TO CART
  // --------------------------------

  const addToCart =
    async (
      id,
      qty = 1,
      options = {}
    ) => {
      const product =
        getProductById(id);

      if (!product) {
        return;
      }


      // --------------------------------
      // SIGNED-IN USER
      // --------------------------------

      if (userId) {
        try {

          await addCartItem(
            toCartItemBody(
              userId,
              id,
              qty,
              options
            )
          );


          const lines =
            await fetchCartLines(
              userId
            );


          setDbCart({
            owner: userId,
            items: lines,
          });


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
      // --------------------------------

      const key =
        cartLineKey(
          id,
          options
        );


      setLocalCart(
        (current) => {

          const existing =
            current.find(
              (line) =>
                line.key === key
            );


          if (existing) {
            return current.map(
              (line) =>
                line.key === key
                  ? {
                      ...line,
                      qty:
                        line.qty +
                        qty,
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
        }
      );


      showToast(
        `Added to cart — ${product.name}`,
        'cart'
      );
    };


  // --------------------------------
  // CHANGE QUANTITY
  // --------------------------------

  const changeQty =
    async (
      key,
      delta
    ) => {

      // --------------------------------
      // SIGNED-IN USER
      // --------------------------------

      if (userId) {

        const item =
          cart.find(
            (line) =>
              line.key === key
          );

        if (!item) {
          return;
        }


        const newQuantity =
          Math.max(
            1,
            item.qty + delta
          );


        try {

          await updateCartItem(
            item.dbId,
            newQuantity
          );


          setDbItems(
            (items) =>
              items.map(
                (line) =>
                  line.key === key
                    ? {
                        ...line,
                        qty:
                          newQuantity,
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


      // --------------------------------
      // GUEST USER
      // --------------------------------

      setLocalCart(
        (current) =>
          current.map(
            (line) =>
              line.key === key
                ? {
                    ...line,
                    qty:
                      Math.max(
                        1,
                        line.qty +
                          delta
                      ),
                  }
                : line
          )
      );
    };


  // --------------------------------
  // REMOVE FROM CART
  // --------------------------------

  const removeFromCart =
    async (key) => {

      // --------------------------------
      // SIGNED-IN USER
      // --------------------------------

      if (userId) {

        const item =
          cart.find(
            (line) =>
              line.key === key
          );

        if (!item) {
          return;
        }


        try {

          await removeCartItem(
            item.dbId
          );


          setDbItems(
            (items) =>
              items.filter(
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


      // --------------------------------
      // GUEST USER
      // --------------------------------

      setLocalCart(
        (current) =>
          current.filter(
            (line) =>
              line.key !== key
          )
      );


      showToast(
        'Item removed from cart'
      );
    };


  // --------------------------------
  // WISHLIST
  // --------------------------------

  const isWishlisted =
    (id) =>
      wishlist.includes(id);


  const toggleWishlist =
    (id) => {

      const adding =
        !wishlist.includes(id);


      setWishlist(
        (current) =>
          adding
            ? [
                ...current,
                id,
              ]
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

  const applyCoupon =
    (rawCode) => {

      const code =
        rawCode
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

  const placeOrder =
    async (
      shipTo,
      payment
    ) => {

      if (
        cart.length === 0
      ) {
        return null;
      }


      // =================================
      // LOGGED-IN USER
      // =================================

      if (userId) {

        try {

          /*
           * The backend reads the user's
           * database cart itself.
           *
           * This is important because the
           * database becomes the source of
           * truth for the order.
           */

          const data =
            await createOrder({
              payment,
              coupon,
              shipTo,
            });


          const order =
            data?.order ||
            data;


          if (!order) {
            throw new Error(
              'The server did not return the created order.'
            );
          }


          // The backend has already cleared
          // the database cart as part of the
          // same transaction.
          setDbCart({
            owner: userId,
            items: [],
          });


          // Add the newly created order
          // immediately to the UI.
          setDbOrders(
            (current) => ({
              owner: userId,

              items: [
                order,
                ...current.items,
              ],
            })
          );


          // Coupon has now been consumed.
          setCoupon(null);


          showToast(
            'Order placed successfully!',
            'cart'
          );


          return order;

        } catch (error) {

          console.error(
            'Could not place order:',
            error
          );


          showToast(
            error.message ||
              'Could not place order',
            'error'
          );


          return null;
        }
      }


      // =================================
      // GUEST USER
      // =================================

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
          new Date()
            .toLocaleDateString(
              'en-IN'
            ),

        items:
          cart,

        total:
          totals.total,

        coupon:
          totals.coupon,

        payment,

        shipTo,

        status:
          'processing',
      };


      setLocalOrders(
        (current) => [
          order,
          ...current,
        ]
      );


      setLocalCart([]);


      setCoupon(null);


      return order;
    };


  // --------------------------------
  // CONTEXT VALUE
  // --------------------------------

  const value = {

    // Cart
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

    cartLoading,


    // Wishlist
    wishlist,

    isWishlisted,

    toggleWishlist,


    // Coupon
    applyCoupon,


    // Orders
    orders,

    placeOrder,

    ordersLoading,
  };


  return (
    <ShopContext.Provider
      value={value}
    >
      {children}
    </ShopContext.Provider>
  );
}