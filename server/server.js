// server/server.js

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// =====================================================
// DATABASE CONNECTION
// =====================================================

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 4000),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || "aurelia_db",

  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});


// =====================================================
// CREATE USERS TABLE
// =====================================================

async function createUsersTable() {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Users table ready");
  } finally {
    connection.release();
  }
}


// =====================================================
// CREATE CART TABLE
// =====================================================

async function createCartTable() {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image_url TEXT,
        quantity INT NOT NULL DEFAULT 1,
        cart_key VARCHAR(255),
        options_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_cart_user (user_id),
        INDEX idx_cart_product (product_id),

        CONSTRAINT fk_cart_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    console.log("Cart items table ready");
  } finally {
    connection.release();
  }
}


// =====================================================
// CREATE ORDERS TABLE
// =====================================================

async function createOrdersTable() {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,

        user_id BIGINT NOT NULL,

        order_number VARCHAR(50) NOT NULL UNIQUE,

        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
        discount DECIMAL(10,2) NOT NULL DEFAULT 0,
        gst DECIMAL(10,2) NOT NULL DEFAULT 0,
        shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
        total DECIMAL(10,2) NOT NULL DEFAULT 0,

        coupon VARCHAR(100),

        payment_method VARCHAR(50) NOT NULL,

        status VARCHAR(50) NOT NULL DEFAULT 'Processing',

        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        INDEX idx_orders_user (user_id),

        CONSTRAINT fk_orders_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    const orderMigrations = [
      "ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER order_number",
      "ALTER TABLE orders ADD COLUMN discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER subtotal",
      "ALTER TABLE orders ADD COLUMN gst DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER discount",
      "ALTER TABLE orders ADD COLUMN shipping DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER gst",
      "ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(30) AFTER customer_email",
      "ALTER TABLE orders ADD COLUMN state VARCHAR(100) AFTER city",
      "ALTER TABLE orders ADD COLUMN pincode VARCHAR(20) AFTER state",
    ];

    for (const migration of orderMigrations) {
      try {
        await connection.query(migration);
      } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') throw error;
      }
    }

    console.log("Orders table ready");
  } finally {
    connection.release();
  }
}


// =====================================================
// CREATE ORDER ITEMS TABLE
// =====================================================

async function createOrderItemsTable() {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,

        order_id BIGINT NOT NULL,

        product_id INT NOT NULL,

        product_name VARCHAR(255) NOT NULL,

        image_url TEXT,

        price DECIMAL(10,2) NOT NULL,

        quantity INT NOT NULL DEFAULT 1,

        options_json TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        INDEX idx_order_items_order (order_id),

        CONSTRAINT fk_order_items_order
          FOREIGN KEY (order_id)
          REFERENCES orders(id)
          ON DELETE CASCADE
      )
    `);

    console.log("Order items table ready");
  } finally {
    connection.release();
  }
}


// =====================================================
// TEST DATABASE
// =====================================================

app.get("/", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      message:
        "AURELIA server is running and database is connected.",
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      database: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      database: false,
    });
  }
});


// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token missing.",
    });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    (error, user) => {
      if (error) {
        return res.status(403).json({
          success: false,
          message: "Invalid or expired token.",
        });
      }

      req.user = user;
      next();
    }
  );
}


// =====================================================
// REGISTER
// =====================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const [existingUsers] =
      await pool.query(
        `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [cleanEmail]
      );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const [result] =
      await pool.query(
        `
        INSERT INTO users
        (name, email, password_hash)
        VALUES (?, ?, ?)
        `,
        [
          name.trim(),
          cleanEmail,
          passwordHash,
        ]
      );

    const token =
      jwt.sign(
        {
          id: result.insertId,
          email: cleanEmail,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

    res.status(201).json({
      success: true,
      message:
        "Account created successfully.",

      token,

      user: {
        id: result.insertId,
        name: name.trim(),
        email: cleanEmail,
      },
    });
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
});


// =====================================================
// LOGIN
// =====================================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const [users] =
      await pool.query(
        `
        SELECT
          id,
          name,
          email,
          password_hash
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [cleanEmail]
      );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const user = users[0];

    const passwordCorrect =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const token =
      jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

    res.json({
      success: true,
      message: "Login successful.",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
});


// =====================================================
// GET CART
// =====================================================

app.get(
  "/api/cart/:userId",
  authenticateToken,
  async (req, res) => {
    try {
      const requestedUserId =
        Number(req.params.userId);

      const loggedInUserId =
        Number(req.user.id);

      if (
        requestedUserId !==
        loggedInUserId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot access another user's cart.",
        });
      }

      const [items] =
        await pool.query(
          `
          SELECT
            id,
            user_id,
            product_id,
            product_name,
            price,
            image_url,
            quantity,
            cart_key,
            options_json,
            created_at,
            updated_at
          FROM cart_items
          WHERE user_id = ?
          ORDER BY created_at DESC
          `,
          [loggedInUserId]
        );

      const cart =
        items.map((item) => {
          let options = {};

          if (item.options_json) {
            try {
              options =
                typeof item.options_json ===
                "string"
                  ? JSON.parse(
                      item.options_json
                    )
                  : item.options_json;
            } catch {
              options = {};
            }
          }

          return {
            ...item,
            options,
          };
        });

      res.json({
        success: true,
        cart,
      });
    } catch (error) {
      console.error(
        "Get cart error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not load cart.",
      });
    }
  }
);


// =====================================================
// ADD TO CART
// =====================================================

app.post(
  "/api/cart",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        productId,
        productName,
        price,
        imageUrl,
        quantity = 1,
        cartKey,
        options = {},
      } = req.body;

      const userId =
        req.user.id;

      if (
        !productId ||
        !productName ||
        price == null
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing cart item details.",
        });
      }

      const finalQuantity =
        Math.max(
          1,
          Number(quantity) || 1
        );

      const finalCartKey =
        cartKey ||
        String(productId);

      const optionsJson =
        JSON.stringify(
          options || {}
        );

      await pool.query(
        `
        INSERT INTO cart_items
        (
          user_id,
          product_id,
          product_name,
          price,
          image_url,
          quantity,
          cart_key,
          options_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE
          quantity =
            quantity + VALUES(quantity),

          product_name =
            VALUES(product_name),

          price =
            VALUES(price),

          image_url =
            VALUES(image_url),

          options_json =
            VALUES(options_json),

          updated_at =
            CURRENT_TIMESTAMP
        `,
        [
          userId,
          productId,
          productName,
          price,
          imageUrl || null,
          finalQuantity,
          finalCartKey,
          optionsJson,
        ]
      );

      res.status(201).json({
        success: true,
        message:
          "Item added to cart.",
      });
    } catch (error) {
      console.error(
        "Add cart error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not add item to cart.",
      });
    }
  }
);


// =====================================================
// UPDATE CART QUANTITY
// =====================================================

app.put(
  "/api/cart/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        quantity,
      } = req.body;

      const newQuantity =
        Number(quantity);

      if (
        !Number.isInteger(
          newQuantity
        ) ||
        newQuantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Quantity must be at least 1.",
        });
      }

      const [result] =
        await pool.query(
          `
          UPDATE cart_items
          SET
            quantity = ?,
            updated_at =
              CURRENT_TIMESTAMP
          WHERE id = ?
            AND user_id = ?
          `,
          [
            newQuantity,
            id,
            req.user.id,
          ]
        );

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Cart item not found.",
        });
      }

      res.json({
        success: true,
        message:
          "Cart updated.",
      });
    } catch (error) {
      console.error(
        "Update cart error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not update cart.",
      });
    }
  }
);


// =====================================================
// DELETE CART ITEM
// =====================================================

app.delete(
  "/api/cart/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const [result] =
        await pool.query(
          `
          DELETE FROM cart_items
          WHERE id = ?
            AND user_id = ?
          `,
          [
            id,
            req.user.id,
          ]
        );

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Cart item not found.",
        });
      }

      res.json({
        success: true,
        message:
          "Item removed from cart.",
      });
    } catch (error) {
      console.error(
        "Delete cart error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not remove item.",
      });
    }
  }
);


// =====================================================
// CLEAR CART
// =====================================================

app.delete(
  "/api/cart/user/:userId",
  authenticateToken,
  async (req, res) => {
    try {
      const requestedUserId =
        Number(req.params.userId);

      const loggedInUserId =
        Number(req.user.id);

      if (
        requestedUserId !==
        loggedInUserId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot clear another user's cart.",
        });
      }

      await pool.query(
        `
        DELETE FROM cart_items
        WHERE user_id = ?
        `,
        [loggedInUserId]
      );

      res.json({
        success: true,
        message:
          "Cart cleared.",
      });
    } catch (error) {
      console.error(
        "Clear cart error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not clear cart.",
      });
    }
  }
);


// =====================================================
// ORDER SETTINGS
// =====================================================

const GST_RATE = 0.18;

const FREE_SHIP_THRESHOLD = 4999;

const SHIP_COST = 199;

const COUPONS = {
  AURELIA10: 0.10,
  WELCOME15: 0.15,
  GOLD20: 0.20,
};


// =====================================================
// ORDER HELPERS
// =====================================================

function parseOptions(value) {
  if (!value) {
    return {};
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}


function calculateOrderTotals(
  cartItems,
  couponCode
) {
  const subtotal =
    cartItems.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(item.quantity),
      0
    );

  let discount = 0;

  const coupon =
    couponCode
      ? String(couponCode)
          .trim()
          .toUpperCase()
      : "";

  if (
    coupon &&
    COUPONS[coupon]
  ) {
    discount =
      subtotal *
      COUPONS[coupon];
  }

  const taxableAmount =
    Math.max(
      0,
      subtotal - discount
    );

  const gst =
    taxableAmount *
    GST_RATE;

  const shipping =
    taxableAmount >=
    FREE_SHIP_THRESHOLD
      ? 0
      : SHIP_COST;

  const total =
    taxableAmount +
    gst +
    shipping;

  return {
    subtotal: Number(
      subtotal.toFixed(2)
    ),

    discount: Number(
      discount.toFixed(2)
    ),

    gst: Number(
      gst.toFixed(2)
    ),

    shipping: Number(
      shipping.toFixed(2)
    ),

    total: Number(
      total.toFixed(2)
    ),

    coupon:
      coupon || null,
  };
}


function generateOrderNumber() {
  const timestamp =
    Date.now()
      .toString()
      .slice(-8);

  const random =
    Math.floor(
      1000 +
      Math.random() * 9000
    );

  return `AUR-${timestamp}-${random}`;
}


function formatFrontendOrder(
  order,
  items
) {
  return {
    id: order.id,

    orderNumber:
      order.order_number,

    userId:
      order.user_id,

    items: items.map(
      (item) => ({
        id: item.id,

        key:
          item.id ||
          item.product_id,

        dbId:
          item.id,

        productId:
          item.product_id,

        productName:
          item.product_name,

        name:
          item.product_name ||
          "Product",

        imageUrl:
          item.image_url,

        img:
          item.image_url ||
          "",

        price:
          Number(item.price) || 0,

        qty:
          Number(item.quantity) || 1,

        quantity:
          Number(item.quantity) || 1,

        options:
          parseOptions(
            item.options_json
          ),
      })
    ),

    subtotal:
      Number(order.subtotal),

    discount:
      Number(order.discount),

    gst:
      Number(order.gst),

    shipping:
      Number(order.shipping),

    total:
      Number(order.total),

    coupon:
      order.coupon,

    payment:
      order.payment_method,

    status:
      order.status,

    shipTo: {
      name:
        order.customer_name,

      email:
        order.customer_email,

      phone:
        order.customer_phone,

      address:
        order.address,

      city:
        order.city,

      state:
        order.state,

      pincode:
        order.pincode,
    },

    createdAt:
      order.created_at,
  };
}


// =====================================================
// CREATE ORDER
// =====================================================

app.post(
  "/api/orders",
  authenticateToken,
  async (req, res) => {
    const connection =
      await pool.getConnection();

    try {
      const {
        payment,
        coupon,
        shipTo,
      } = req.body;

      if (!payment) {
        return res.status(400).json({
          success: false,
          message:
            "Payment method is required.",
        });
      }

      if (!shipTo) {
        return res.status(400).json({
          success: false,
          message:
            "Shipping details are required.",
        });
      }

      const allowedPayments = [
        "Card",
        "UPI",
        "Net Banking",
        "Cash on Delivery",
      ];

      if (
        !allowedPayments.includes(
          payment
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment method.",
        });
      }

      await connection.beginTransaction();

      const [cartItems] =
        await connection.query(
          `
          SELECT
            id,
            user_id,
            product_id,
            product_name,
            price,
            image_url,
            quantity,
            options_json
          FROM cart_items
          WHERE user_id = ?
          ORDER BY created_at ASC
          FOR UPDATE
          `,
          [req.user.id]
        );

      if (
        cartItems.length === 0
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message:
            "Your cart is empty.",
        });
      }

      const totals =
        calculateOrderTotals(
          cartItems,
          coupon
        );

      const orderNumber =
        generateOrderNumber();

      const customerName =
        String(
          shipTo.name || ""
        ).trim();

      const customerEmail =
        String(
          shipTo.email || req.user.email || ""
        ).trim();

      const customerPhone =
        String(
          shipTo.phone || ""
        ).trim();

      const address =
        String(
          shipTo.address || ""
        ).trim();

      const city =
        String(
          shipTo.city || ""
        ).trim();

      const state =
        String(
          shipTo.state || ""
        ).trim();

      const pincode =
        String(
          shipTo.pincode || ""
        ).trim();

      if (
        !customerName ||
        !customerEmail ||
        !customerPhone ||
        !address ||
        !city ||
        !state ||
        !pincode
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message:
            "Please complete all shipping details.",
        });
      }

      const [orderResult] =
        await connection.query(
          `
          INSERT INTO orders
          (
            user_id,
            order_number,
            subtotal,
            discount,
            gst,
            shipping,
            total,
            coupon,
            payment_method,
            status,
            customer_name,
            customer_email,
            customer_phone,
            address,
            city,
            state,
            pincode
          )
          VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            req.user.id,
            orderNumber,
            totals.subtotal,
            totals.discount,
            totals.gst,
            totals.shipping,
            totals.total,
            totals.coupon,
            payment,
            "Processing",
            customerName,
            customerEmail,
            customerPhone,
            address,
            city,
            state,
            pincode,
          ]
        );

      const orderId =
        orderResult.insertId;

      for (
        const item of cartItems
      ) {
        await connection.query(
          `
          INSERT INTO order_items
          (
            order_id,
            product_id,
            product_name,
            image_url,
            price,
            quantity,
            options_json
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            orderId,
            item.product_id,
            item.product_name,
            item.image_url ||
              null,
            item.price,
            item.quantity,
            item.options_json ||
              null,
          ]
        );
      }

      await connection.query(
        `
        DELETE FROM cart_items
        WHERE user_id = ?
        `,
        [req.user.id]
      );

      await connection.commit();

      const [savedOrders] =
        await pool.query(
          `
          SELECT *
          FROM orders
          WHERE id = ?
          LIMIT 1
          `,
          [orderId]
        );

      const [savedItems] =
        await pool.query(
          `
          SELECT *
          FROM order_items
          WHERE order_id = ?
          ORDER BY id ASC
          `,
          [orderId]
        );

      const frontendOrder =
        formatFrontendOrder(
          savedOrders[0],
          savedItems
        );

      res.status(201).json({
        success: true,
        message:
          "Order placed successfully.",
        order:
          frontendOrder,
      });
    } catch (error) {
      try {
        await connection.rollback();
      } catch {}

      console.error(
        "CREATE ORDER ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Could not place order.",
      });
    } finally {
      connection.release();
    }
  }
);


// =====================================================
// GET ORDERS
// =====================================================

app.get(
  "/api/orders",
  authenticateToken,
  async (req, res) => {
    try {
      const [orders] =
        await pool.query(
          `
          SELECT *
          FROM orders
          WHERE user_id = ?
          ORDER BY created_at DESC
          `,
          [req.user.id]
        );

      if (
        orders.length === 0
      ) {
        return res.json({
          success: true,
          orders: [],
        });
      }

      const orderIds =
        orders.map(
          (order) => order.id
        );

      const placeholders =
        orderIds
          .map(() => "?")
          .join(",");

      const [items] =
        await pool.query(
          `
          SELECT *
          FROM order_items
          WHERE order_id IN (${placeholders})
          ORDER BY id ASC
          `,
          orderIds
        );

      const itemsByOrder =
        {};

      for (
        const item of items
      ) {
        if (
          !itemsByOrder[
            item.order_id
          ]
        ) {
          itemsByOrder[
            item.order_id
          ] = [];
        }

        itemsByOrder[
          item.order_id
        ].push(item);
      }

      const formattedOrders =
        orders.map(
          (order) =>
            formatFrontendOrder(
              order,
              itemsByOrder[
                order.id
              ] || []
            )
        );

      res.json({
        success: true,
        orders:
          formattedOrders,
      });
    } catch (error) {
      console.error(
        "GET ORDERS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not load orders.",
      });
    }
  }
);


// =====================================================
// GET USERS
// =====================================================

app.get(
  "/api/users",
  async (req, res) => {
    try {
      const [users] =
        await pool.query(
          `
          SELECT
            id,
            name,
            email,
            created_at
          FROM users
          ORDER BY created_at DESC
          `
        );

      res.json({
        success: true,
        users,
      });
    } catch (error) {
      console.error(
        "Users error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not load users.",
      });
    }
  }
);


// =====================================================
// START SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  "0.0.0.0",
  async () => {
    console.log(
      `AURELIA server running on port ${PORT}`
    );

    try {
      await createUsersTable();

      await createCartTable();

      await createOrdersTable();

      await createOrderItemsTable();

      await pool.query(
        "SELECT 1"
      );

      console.log(
        "TiDB Cloud database connected successfully."
      );
    } catch (error) {
      console.error(
        "Database initialization failed:"
      );

      console.error(
        error.message
      );
    }
  }
);