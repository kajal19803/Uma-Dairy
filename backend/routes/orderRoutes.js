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
const { createShiprocketOrder,cancelShiprocketOrder } = require("../services/shiprocketService");
const {
  calculateSubtotal,
  applyCoupon,
  calculateGST,
} = require("../services/orderCalculationService");

const {
  getShippingCharge,
} = require("../services/deliveryService");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 📦 1. Place Order Route

router.post("/", authMiddleware, async (req, res) => {

try {
const { items, address, phone, couponCode,} = req.body;
const userId = req.user.id;
const { subtotal,finalItems,} = await calculateSubtotal(items);
const { discount, appliedCoupon, } = await applyCoupon( couponCode, subtotal);
const { taxableAmount, gst,} = calculateGST( subtotal, discount);
const shipping = await getShippingCharge({

deliveryPincode: address.zip,
paymentMethod: "Prepaid", weight:0.5,

});

if(!shipping.success){

return res.status(400).json({ message: shipping.message, });

}

const finalAmount = taxableAmount + gst + shipping.shippingCharge;

const order = await Order.create({
orderId:
`ORDER_${Date.now()}`, userId,
items: finalItems,
address, phone,
totalPrice: subtotal,
couponCode: appliedCoupon,
discount,finalAmount,
shipping:{
charge: shipping.shippingCharge,
courier:shipping.courier,
estimatedDelivery: shipping.estimatedDelivery,

},

paymentStatus: "PENDING",
orderStatus: "PENDING",

});

return res.status(201).json({ message: "Order placed successfully", order,});

}

catch(err){

console.error(err);

return res.status(500).json({ message: err.message,});

}

});
router.post("/payment/make-payment", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;

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
    const amount = Math.round(order.finalAmount * 100);
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
   console.log("Saving order...");
   if (order.couponCode) {

  const coupon = await Coupon.findOne({
    code: order.couponCode.toUpperCase(),
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
// ==============================
// Cancel Order
// ==============================

router.patch("/:orderId/cancel", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

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

    // Already cancelled
    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Order already cancelled",
      });
    }

    // Cannot cancel shipped / delivered orders
    if (
      order.orderStatus === "SHIPPED" ||
      order.orderStatus === "DELIVERED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled now",
      });
    }

    // ======================================
    // Razorpay Refund
    // ======================================
    if (
  order.refund.status === "PROCESSING" ||
  order.refund.status === "COMPLETED"
) {
  return res.status(400).json({
    success: false,
    message: "Refund already initiated",
  });
}
    if (
      order.paymentMethod === "ONLINE" &&
      order.paymentStatus === "PAID"
    ) {
      try {
        const refund = await razorpay.payments.refund(
          order.razorpayPaymentId,
          {
            speed: "normal",
          }
        );

        console.log("✅ Refund Initiated");
        console.log(refund);

        order.refund.status = "PROCESSING";
        order.refund.refundId = refund.id;

      } catch (err) {

        console.error(
          "❌ Refund Error:",
          err.error || err.message
        );

        return res.status(400).json({
          success: false,
          message: "Refund could not be initiated.",
        });
      }
    }
   // ======================================
// Cancel Shiprocket Order
// ======================================

if (order.shiprocket.orderId) {
  try {

    await cancelShiprocketOrder(
      order.shiprocket.orderId
    );

    console.log("🚚 Shiprocket order cancelled.");

    order.shiprocket.trackingStatus = "Cancelled";

  } catch (err) {

    console.error(
      "❌ Shiprocket Cancel Error:",
      err.response?.data || err.message
    );

    return res.status(400).json({
      success: false,
      message: "Failed to cancel Shiprocket order.",
    });
  }
}

    // ======================================
    // Cancel Order
    // ======================================

    order.orderStatus = "CANCELLED";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
    });

  } catch (err) {

    console.error("❌ Cancel Order Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
});

module.exports = router;
