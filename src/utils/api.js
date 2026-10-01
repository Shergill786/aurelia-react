// src/utils/api.js

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

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
// LOGIN
// ===============================

export async function loginUser(email, password) {
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Login failed"
    );
  }

  return data;
}

// ===============================
// REGISTER
// ===============================

export async function registerUser(
  name,
  email,
  password
) {
  const response = await fetch(
    `${API_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Registration failed"
    );
  }

  return data;
}

// ===============================
// GET CART
// ===============================

export async function getCart(userId) {
  const response = await fetch(
    `${API_URL}/api/cart/${userId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Could not load cart"
    );
  }

  return data;
}

// ===============================
// ADD CART ITEM
// ===============================

export async function addCartItem(item) {
  const response = await fetch(
    `${API_URL}/api/cart`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Could not add item to cart"
    );
  }

  return data;
}

// ===============================
// UPDATE CART ITEM
// ===============================

export async function updateCartItem(
  cartItemId,
  quantity
) {
  const response = await fetch(
    `${API_URL}/api/cart/${cartItemId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        quantity,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Could not update cart"
    );
  }

  return data;
}

// ===============================
// REMOVE CART ITEM
// ===============================

export async function removeCartItem(
  cartItemId
) {
  const response = await fetch(
    `${API_URL}/api/cart/${cartItemId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Could not remove item"
    );
  }

  return data;
}

// ===============================
// CLEAR CART
// ===============================

export async function clearCart(userId) {
  const response = await fetch(
    `${API_URL}/api/cart/user/${userId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Could not clear cart"
    );
  }

  return data;
}