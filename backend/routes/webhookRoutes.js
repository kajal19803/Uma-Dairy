const express = require("express");
const router = express.Router();

const Order = require("../models/Order");

// ===================================
// Shiprocket Webhook
// ===================================

router.post("/tracking", async (req, res) => {
  try {
    console.log("\n==============================");
    console.log("🚚 SHIPROCKET WEBHOOK HIT");
    console.log("==============================");

    console.log("Headers:");
    console.log(req.headers);

    console.log("\nBody:");
    console.log(req.body);

    // ===========================
    // TEMPORARY
    // Authentication disabled
    // ===========================

    /*
    const apiKey = req.headers["x-api-key"];

    console.log("Received Key:", apiKey);
    console.log("Expected Key:", process.env.SHIPROCKET_WEBHOOK_KEY);

    if (apiKey !== process.env.SHIPROCKET_WEBHOOK_KEY) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    */

    const {
      awb,
      shipment_id,
      current_status,
      courier_name,
      tracking_url,
      order_id,
    } = req.body;

    console.log("Shipment ID:", shipment_id);
    console.log("Order ID:", order_id);
    console.log("Current Status:", current_status);

    // Test webhook me shipment_id nahi bhi ho sakta
    if (!shipment_id) {
      console.log("⚠️ Test webhook received (No shipment_id)");

      return res.status(200).json({
        success: true,
        message: "Test webhook received",
      });
    }

    const order = await Order.findOne({
      "shiprocket.shipmentId": shipment_id.toString(),
    });

    if (!order) {
      console.log("❌ Order not found");

      return res.status(200).json({
        success: true,
        message: "Webhook received but order not found",
      });
    }

    // Update Shiprocket details

    if (awb) order.shiprocket.awbCode = awb;
    if (courier_name) order.shiprocket.courierName = courier_name;
    if (tracking_url) order.shiprocket.trackingUrl = tracking_url;
    if (current_status) order.shiprocket.trackingStatus = current_status;

    const status = current_status?.toUpperCase() || "";

    if (status.includes("SHIPPED")) {
      order.orderStatus = "SHIPPED";
    }

    if (status.includes("DELIVERED")) {
      order.orderStatus = "DELIVERED";
    }

    if (
      status.includes("CANCEL") ||
      status.includes("RTO")
    ) {
      order.orderStatus = "CANCELLED";
    }

    await order.save();

    console.log("✅ Order updated successfully");

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });

  } catch (err) {

    console.error("❌ WEBHOOK ERROR");
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });

  }
});

module.exports = router;


