const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authMiddleware } = require('../middleware/authMiddleware');
const axios = require('axios');
const Razorpay = require("razorpay");
const crypto = require("crypto");
require('dotenv').config();
const User = require("../models/User");
const Coupon = require("../models/couponSchema");

const {  sendOrderConfirmation,sendAdminOrder } = require("../utils/sendOrderEmail");
const Product = require('../models/Product');
const { createShiprocketOrder } = require("../services/shiprocketService");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 📦 1. Place Order Route

router.post('/', authMiddleware , async (req, res) => {
  try {
    const { items, address, totalPrice, phone } = req.body;
    
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || !address || !totalPrice || !phone) {
      return res.status(400).json({ message: 'Missing or invalid order details' });
    }

    // ✅ Enrich items with full product details from DB
    const finalItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item._id);

        if (!product) {
          return {
            productId: item._id,
            name: 'Deleted Product',
            description: '',
            mrp: 0,
            discount: 0,
            price: 0,
            images: [],
            category: '',
            unit: '',
            ingredients: '',
            nutritionalInfo: '',
            quantity: item.quantity,
            inStock: false,
          };
        }

        return {
          productId: product._id,
          name: product.name,
          description: product.description,
          mrp: product.mrp,
          discount: product.discount,
          price: product.price,
          images: product.images,
          category: product.category,
          unit: product.unit,
          ingredients: product.ingredients,
          nutritionalInfo: product.nutritionalInfo,
          quantity: item.quantity,
          inStock: true,
        };
      })
    );

    const orderId = `ORDER_${Date.now()}`;
    const newOrder = new Order({
      orderId,
      userId,
      items: finalItems,
      address,
      totalPrice,
      phone,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
    });
    const savedOrder = await newOrder.save();
    
    res.status(201).json({
       message: 'Order placed successfully',
       order: {
       orderId: savedOrder.orderId,
       totalPrice: savedOrder.totalPrice,
       items: finalItems,
       address: savedOrder.address,
       phone: savedOrder.phone,
       paymentStatus: savedOrder.paymentStatus,
       orderStatus: savedOrder.orderStatus,
       createdAt: savedOrder.createdAt,
       },
    });

  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post("/payment/make-payment", authMiddleware, async (req, res) => {
  try {
    const { orderId, couponCode, finalAmount } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Existing order check
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ownership check
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Already paid?
    if (order.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Order already paid",
      });
    }

    // Amount in paisa
    const amount = Math.round(finalAmount * 100);
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: order.orderId,
      notes: {
        orderId: order.orderId,
        userId: req.user._id.toString(),
      },
    });

    res.json({
      success: true,

      key: process.env.RAZORPAY_KEY_ID,

      razorpayOrderId: razorpayOrder.id,

      amount: razorpayOrder.amount,

      currency: razorpayOrder.currency,

      receipt: razorpayOrder.receipt,

      orderId: order.orderId,

      customer: {
        name: req.user.name,
        email: req.user.email,
        contact: order.phone,
      },
    });

  } catch (error) {
    console.error("❌ Razorpay make-payment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
    });
  }
});

router.post("/payment/verify", authMiddleware, async (req, res) => {
  console.log("========== VERIFY API ==========");
console.log("BODY:", req.body);
console.log("USER:", req.user._id);
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      couponCode,
  discount,
  finalAmount,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // Find existing order
    const order = await Order.findOne({ orderId });
    console.log("ORDER FOUND:", order);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check ownership
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Already paid
    if (order.paymentStatus === "PAID") {
      return res.json({
        success: true,
        message: "Order already paid",
        orderId: order.orderId,
      });
    }

    // Verify Razorpay Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    console.log("Expected:", expectedSignature);
    console.log("Received:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "FAILED";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Payment Successful
    order.paymentMethod = "ONLINE";
    order.paymentStatus = "PAID";
    order.orderStatus = "PLACED";

    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    order.paidAt = new Date();
    order.placedAt = new Date();
    // Save coupon information
order.couponCode = couponCode || "";
order.discount = discount || 0;
order.finalAmount = finalAmount || order.totalPrice;
   console.log("Saving order...");
   if (couponCode) {

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
  });

  if (coupon) {

    coupon.usedCount += 1;

    const alreadyUsed = coupon.usersUsed.some(
  (id) => id.toString() === req.user._id.toString()
);

if (!alreadyUsed) {
  coupon.usersUsed.push(req.user._id);
}

    await coupon.save();
  }
}
    await order.save();

// ==============================
// Create Shiprocket Order
// ==============================

try {
  await createShiprocketOrder(order);
  console.log("🚚 Shiprocket order created successfully.");
} catch (err) {
  console.error(
    "❌ Shiprocket Error:",
    err.response?.data || err.message
  );
}

const user = await User.findById(order.userId);

sendOrderConfirmation(order, user);
sendAdminOrder(order, user);

console.log("Order saved successfully");


    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      orderId: order.orderId,
      paymentId: razorpay_payment_id,
    });

  } catch (error) {
    console.error("❌ Razorpay verify error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});
/*
router.post('/place-cod', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log(orderId);
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order belongs to the logged-in user
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized access to this order' });
    }

    // Check if already paid or already confirmed
    if (order.paymentStatus === 'PAID' || order.orderStatus === 'PLACED') {
      return res.status(400).json({ error: 'Order already confirmed or paid' });
    }

    // Update order for COD
    order.paymentMethod = 'COD';
    order.paymentStatus = 'PENDING';
    order.orderStatus = 'PLACED';
    order.placedAt = new Date();

    await order.save();

    res.status(200).json({ success: true, message: 'COD order placed successfully' });
  } catch (error) {
    console.error('❌ Error placing COD order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});*/

module.exports = router;
