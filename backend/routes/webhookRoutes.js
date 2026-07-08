const express = require("express");
const router = express.Router();

router.use(express.json());

const Order = require("../models/Order");

// ===================================
// Shiprocket Webhook
// ===================================

router.post("/tracking", async (req, res) => {
  try {
    // Verify API Key
    const apiKey = req.headers["x-api-key"];

    if (apiKey !== process.env.SHIPROCKET_WEBHOOK_KEY) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log("📩 Shiprocket Webhook Received");
    console.log(req.body);

    const {
      awb,
      shipment_id,
      current_status,
      courier_name,
      tracking_url,
      order_id,
    } = req.body;

    const shipmentId = shipment_id?.toString();

    // Find Order
    const order = await Order.findOne({
      "shiprocket.shipmentId": shipmentId,
    });

    if (!order) {
      console.log("❌ Order not found");

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ============================
    // Update Shiprocket Details
    // ============================

    if (awb) {
      order.shiprocket.awbCode = awb;
    }

    if (courier_name) {
      order.shiprocket.courierName = courier_name;
    }

    if (tracking_url) {
      order.shiprocket.trackingUrl = tracking_url;
    }

    if (current_status) {
      order.shiprocket.trackingStatus = current_status;
    }

    // ============================
    // Update Order Status
    // ============================

    const status = current_status?.toUpperCase();

    if (status?.includes("SHIPPED")) {
      order.orderStatus = "SHIPPED";
    }

    if (status?.includes("DELIVERED")) {
      order.orderStatus = "DELIVERED";
    }

    if (
      status?.includes("CANCEL") ||
      status?.includes("RTO")
    ) {
      order.orderStatus = "CANCELLED";
    }

    await order.save();

    console.log("✅ Order updated from Shiprocket");

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });

  } catch (err) {

    console.error(
      "❌ Shiprocket Webhook Error:",
      err.response?.data || err.message
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
});

module.exports = router;


