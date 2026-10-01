// server/server.js

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ===============================
// DATABASE CONNECTION
// ===============================

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 4000),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || "aurelia_db",

  // REQUIRED FOR TiDB CLOUD
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});


// ===============================
// CREATE USERS TABLE
// ===============================

async function createUsersTable() {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
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


// ===============================
// TEST DATABASE
// ===============================

app.get("/", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      message:
        "AURELIA server is running and database is connected.",
    });
  } catch (error) {
    console.error(
      "Database error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});


// ===============================
// HEALTH CHECK
// ===============================

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


// ===============================
// REGISTER
// ===============================

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
        "SELECT id FROM users WHERE email = ? LIMIT 1",
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

    const token = jwt.sign(
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


// ===============================
// LOGIN
// ===============================

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

    const token = jwt.sign(
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


// ===============================
// GET CART
// ===============================

app.get(
  "/api/cart/:userId",
  async (req, res) => {
    try {
      const { userId } = req.params;

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
          [userId]
        );

      const cart = items.map(
        (item) => {
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
            } catch (error) {
              options = {};
            }
          }

          return {
            ...item,
            options,
          };
        }
      );

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


// ===============================
// ADD TO CART
// ===============================

app.post(
  "/api/cart",
  async (req, res) => {
    try {
      const {
        userId,
        productId,
        productName,
        price,
        imageUrl,
        quantity = 1,
        cartKey,
        options = {},
      } = req.body;

      if (
        !userId ||
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

      // If frontend does not provide a cart key,
      // use the product ID as a fallback.
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


// ===============================
// UPDATE CART QUANTITY
// ===============================

app.put(
  "/api/cart/:id",
  async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

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
          `,
          [
            newQuantity,
            id,
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


// ===============================
// DELETE CART ITEM
// ===============================

app.delete(
  "/api/cart/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      const [result] =
        await pool.query(
          `
          DELETE FROM cart_items
          WHERE id = ?
          `,
          [id]
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


// ===============================
// CLEAR CART
// ===============================

app.delete(
  "/api/cart/user/:userId",
  async (req, res) => {
    try {
      const { userId } = req.params;

      await pool.query(
        `
        DELETE FROM cart_items
        WHERE user_id = ?
        `,
        [userId]
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


// ===============================
// GET USERS
// ===============================

app.get(
  "/api/users",
  async (req, res) => {
    try {
      const [users] =
        await pool.query(`
          SELECT
            id,
            name,
            email,
            created_at
          FROM users
          ORDER BY created_at DESC
        `);

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


// ===============================
// START SERVER
// ===============================

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

      await pool.query(
        "SELECT 1"
      );

      console.log(
        "TiDB Cloud database connected successfully."
      );
    } catch (error) {
      console.error(
        "Database connection failed:"
      );

      console.error(
        error.message
      );
    }
  }
);