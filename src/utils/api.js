// src/utils/api.js
//
// All calls to the Aurelia server go through request(), so every endpoint
// gets the same handling for:
//   - non-JSON replies (e.g. an HTML "502 Bad Gateway" page while Render wakes up)
//   - the server being unreachable or taking too long
//   - expired / invalid login tokens (the app is told to sign the user out)

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// Render's free tier can take ~50s to wake up, so allow a generous timeout.
const TIMEOUT_MS = 60000;

/** Event fired when the server rejects our token; AuthContext listens for it. */
export const SESSION_EXPIRED_EVENT = "aurelia:session-expired";

/** Error with the HTTP status attached, so callers can tell failures apart. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ===============================
// AUTH HEADERS
// ===============================

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

// ===============================
// SHARED REQUEST HELPER
// ===============================

async function request(path, { method = "GET", body, auth = false, fallbackMessage }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: auth
        ? getAuthHeaders()
        : { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    // fetch() only throws when there is no reply at all.
    throw new ApiError(
      error.name === "AbortError"
        ? "The server took too long to respond. Please try again."
        : "Can't reach the server. Check your connection and try again.",
      0
    );
  } finally {
    clearTimeout(timer);
  }

  // Read the reply as text first: an error page is HTML, not JSON.
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    // Token missing, expired or for another user: tell the app to sign out.
    if (auth && (response.status === 401 || response.status === 403)) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      throw new ApiError("Your session has expired. Please sign in again.", response.status);
    }

    const message =
      data.message ||
      (response.status >= 500
        ? "The server is having trouble right now. Please try again in a minute."
        : fallbackMessage);

    throw new ApiError(message, response.status);
  }

  return data;
}

// ===============================
// AUTH
// ===============================

export function loginUser(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: { email, password },
    fallbackMessage: "Login failed",
  });
}

export function registerUser(name, email, password) {
  return request("/api/auth/register", {
    method: "POST",
    body: { name, email, password },
    fallbackMessage: "Registration failed",
  });
}

// ===============================
// CART
// ===============================

export function getCart(userId) {
  return request(`/api/cart/${userId}`, {
    auth: true,
    fallbackMessage: "Could not load cart",
  });
}

export function addCartItem(item) {
  return request("/api/cart", {
    method: "POST",
    body: item,
    auth: true,
    fallbackMessage: "Could not add item to cart",
  });
}

export function updateCartItem(cartItemId, quantity) {
  return request(`/api/cart/${cartItemId}`, {
    method: "PUT",
    body: { quantity },
    auth: true,
    fallbackMessage: "Could not update cart",
  });
}

export function removeCartItem(cartItemId) {
  return request(`/api/cart/${cartItemId}`, {
    method: "DELETE",
    auth: true,
    fallbackMessage: "Could not remove item",
  });
}

export function clearCart(userId) {
  return request(`/api/cart/user/${userId}`, {
    method: "DELETE",
    auth: true,
    fallbackMessage: "Could not clear cart",
  });
}