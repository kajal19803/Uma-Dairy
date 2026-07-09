const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const Order = require("../models/Order");

// ======================================
// Razorpay Refund Webhook
// ======================================

router.post("/", async (req, res) => {
  try {

    // ======================================
    // Verify Signature
    // ======================================

    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.log("❌ Invalid Razorpay Signature");

      return res.status(400).json({
        success: false,
        message: "Invalid Signature",
      });
    }

    // ======================================
    // Parse Payload
    // ======================================

    const payload = JSON.parse(req.body.toString());

    console.log("========== RAZORPAY WEBHOOK ==========");
    console.log("Event:", payload.event);

    const refund =
      payload.payload?.refund?.entity;

    if (!refund) {
      return res.status(200).json({
        success: true,
      });
    }

    // ======================================
    // Find Order
    // ======================================

    const order = await Order.findOne({
      razorpayPaymentId: refund.payment_id,
    });

    if (!order) {
      console.log("❌ Order not found");

      return res.status(200).json({
        success: true,
      });
    }

    // ======================================
    // refund.created
    // ======================================

    if (payload.event === "refund.created") {

      order.refund.status = "PROCESSING";
      order.refund.refundId = refund.id;

    }

    // ======================================
    // refund.processed
    // ======================================

    if (payload.event === "refund.processed") {

      order.refund.status = "COMPLETED";
      order.refund.refundedAt = new Date();

    }

    // ======================================
    // refund.failed
    // ======================================

    if (payload.event === "refund.failed") {

      order.refund.status = "FAILED";

    }

    await order.save();

    console.log(
      `✅ Refund Updated : ${order.orderId}`
    );

    return res.status(200).json({
      success: true,
    });

  } catch (err) {

    console.error(
      "❌ Razorpay Webhook Error:",
      err.message
    );

    return res.status(500).json({
      success: false,
    });

  }
});

module.exports = router;