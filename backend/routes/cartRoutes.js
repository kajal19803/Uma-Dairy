const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');
const Product = require("../models/Product");


router.get("/", authMiddleware, async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .populate("cart.product");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Remove deleted products from cart
    const cart = user.cart.filter((item) => item.product);

    if (cart.length !== user.cart.length) {
      user.cart = cart;
      await user.save();
    }

    res.status(200).json({
      cart,
    });

  } catch (err) {
    console.error("Get Cart Error:", err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});
router.post("/add", authMiddleware, async (req, res) => {
  try {

    const { productId, quantity = 1 } = req.body;

    // Convert quantity to number
    const qty = Number(quantity);

    // Validate request
    if (!productId || !Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if product already exists in cart
    const existing = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existing) {
      existing.quantity += qty;
    } else {
      user.cart.push({
        product: productId,
        quantity: qty,
      });
    }

    await user.save();
    await user.populate("cart.product");

    res.status(200).json({
      message: "Added Successfully",
      cart: user.cart,
    });

  } catch (err) {
    console.error("Add Cart Error:", err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});
router.put("/update", authMiddleware, async (req, res) => {
  try {

    const { productId, quantity } = req.body;

    // Convert quantity to number
    const qty = Number(quantity);

    // Validate request
    if (!productId || !Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Find cart item
    const item = user.cart.find(
      (i) => i.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Update quantity
    item.quantity = qty;

    await user.save();
    await user.populate("cart.product");

    res.status(200).json({
      message: "Quantity Updated Successfully",
      cart: user.cart,
    });

  } catch (err) {
    console.error("Update Cart Error:", err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});
router.delete("/remove", authMiddleware, async (req, res) => {
  try {

    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();
    await user.populate("cart.product");

    res.status(200).json({
      message: "Item Removed Successfully",
      cart: user.cart,
    });

  } catch (err) {
    console.error("Remove Cart Error:", err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});
router.delete("/clear", authMiddleware, async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.cart = [];

    await user.save();

    res.status(200).json({
      message: "Cart Cleared Successfully",
      cart: [],
    });

  } catch (err) {
    console.error("Clear Cart Error:", err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});


module.exports = router;