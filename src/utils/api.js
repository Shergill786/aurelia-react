// src/utils/api.js
//
// All calls to the Aurelia server go through request(), so every endpoint
// gets the same handling for:
//   - non-JSON replies
//   - server being unreachable or taking too long
//   - expired / invalid login tokens
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// Render's free tier can take time to wake up.
const TIMEOUT_MS = 60000;

/** Event fired when the server rejects our token. */
export const SESSION_EXPIRED_EVENT =
  "aurelia:session-expired";

/** Error with the HTTP status attached. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}


// =========================================================
// AUTH HEADERS
// =========================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};


// =========================================================
// SHARED REQUEST HELPER
// =========================================================

async function request(
  path,
  {
    method = "GET",
    body,
    auth = false,
    fallbackMessage,
  }
) {
  const controller =
    new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    TIMEOUT_MS
  );

  let response;

  try {
    response = await fetch(
      `${API_URL}${path}`,
      {
        method,

        headers: auth
          ? getAuthHeaders()
          : {
              "Content-Type":
                "application/json",
            },

        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,

        signal:
          controller.signal,
      }
    );
  } catch (error) {
    throw new ApiError(
      error.name === "AbortError"
        ? "The server took too long to respond. Please try again."
        : "Can't reach the server. Check your connection and try again.",
      0
    );
  } finally {
    clearTimeout(timer);
  }


  // -------------------------------------------------------
  // Read response as text first.
  // This prevents HTML error pages from breaking JSON parsing.
  // -------------------------------------------------------

  const text =
    await response.text();

  let data = {};

  try {
    data = text
      ? JSON.parse(text)
      : {};
  } catch {
    data = {};
  }


  // -------------------------------------------------------
  // Handle errors
  // -------------------------------------------------------

  if (!response.ok) {

    // Expired or invalid authentication.
    if (
      auth &&
      (
        response.status === 401 ||
        response.status === 403
      )
    ) {
      window.dispatchEvent(
        new Event(
          SESSION_EXPIRED_EVENT
        )
      );

      throw new ApiError(
        "Your session has expired. Please sign in again.",
        response.status
      );
    }


    const message =
      data.message ||
      (
        response.status >= 500
          ? "The server is having trouble right now. Please try again in a minute."
          : fallbackMessage
      );

    throw new ApiError(
      message,
      response.status
    );
  }


  return data;
}


// =========================================================
// AUTH
// =========================================================

export function loginUser(
  email,
  password
) {
  return request(
    "/api/auth/login",
    {
      method: "POST",

      body: {
        email,
        password,
      },

      fallbackMessage:
        "Login failed",
    }
  );
}


export function registerUser(
  name,
  email,
  password
) {
  return request(
    "/api/auth/register",
    {
      method: "POST",

      body: {
        name,
        email,
        password,
      },

      fallbackMessage:
        "Registration failed",
    }
  );
}


// =========================================================
// CART
// =========================================================

export function getCart(
  userId
) {
  return request(
    `/api/cart/${userId}`,
    {
      auth: true,

      fallbackMessage:
        "Could not load cart",
    }
  );
}


export function addCartItem(
  item
) {
  return request(
    "/api/cart",
    {
      method: "POST",

      body: item,

      auth: true,

      fallbackMessage:
        "Could not add item to cart",
    }
  );
}


export function updateCartItem(
  cartItemId,
  quantity
) {
  return request(
    `/api/cart/${cartItemId}`,
    {
      method: "PUT",

      body: {
        quantity,
      },

      auth: true,

      fallbackMessage:
        "Could not update cart",
    }
  );
}


export function removeCartItem(
  cartItemId
) {
  return request(
    `/api/cart/${cartItemId}`,
    {
      method: "DELETE",

      auth: true,

      fallbackMessage:
        "Could not remove item",
    }
  );
}


export function clearCart(
  userId
) {
  return request(
    `/api/cart/user/${userId}`,
    {
      method: "DELETE",

      auth: true,

      fallbackMessage:
        "Could not clear cart",
    }
  );
}


// =========================================================
// ORDERS
// =========================================================

/**
 * Get all orders belonging to the logged-in user.
 */
export function getOrders() {
  return request(
    "/api/orders",
    {
      auth: true,

      fallbackMessage:
        "Could not load orders",
    }
  );
}


/**
 * Create a new order.
 *
 * The backend reads the user's current database cart,
 * calculates the total, saves the order and order items,
 * and clears the cart in one transaction.
 */
export function createOrder(
  orderData
) {
  return request(
    "/api/orders",
    {
      method: "POST",

      body: orderData,

      auth: true,

      fallbackMessage:
        "Could not place order",
    }
  );
}