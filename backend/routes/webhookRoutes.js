const express = require("express");
const router = express.Router();

const Order = require("../models/Order");

// ===================================
// Shiprocket Tracking Webhook
// ===================================

router.post("/tracking", async (req, res) => {
  try {
    // ===================================
    // Verify API Key
    // ===================================

    const apiKey = req.headers["x-api-key"];

    if (apiKey !== process.env.SHIPROCKET_WEBHOOK_KEY) {
      console.log("❌ Invalid Shiprocket API Key");

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log("📩 Shiprocket Webhook Received");

    const {
      awb,
      shipment_id,
      current_status,
      courier_name,
      tracking_url,
      order_id,
    } = req.body;

    // ===================================
    // Ignore Test Webhook
    // ===================================

    if (!shipment_id) {
      console.log("⚠️ Shiprocket Test Webhook");

      return res.status(200).json({
        success: true,
        message: "Test webhook received",
      });
    }

    // ===================================
    // Find Order
    // ===================================

    const order = await Order.findOne({
      "shiprocket.shipmentId": shipment_id.toString(),
    });

    if (!order) {
      console.log(
        `❌ Order not found for Shipment ID: ${shipment_id}`
      );

      return res.status(200).json({
        success: true,
        message: "Order not found",
      });
    }

    // ===================================
    // Update Shiprocket Details
    // ===================================

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

    // ===================================
    // Update Main Order Status
    // ===================================

    const status = current_status?.toUpperCase() || "";

   // ===================================
// Update Main Order Status
// ===================================

const status = current_status?.toUpperCase() || "";

// Save latest Shiprocket status
order.shiprocket.trackingStatus = current_status;

// Order Status Mapping

if (status.includes("AWB ASSIGNED")) {
  order.orderStatus = "PLACED";
}

else if (
  status.includes("READY TO SHIP") ||
  status.includes("PICKUP SCHEDULED") ||
  status.includes("PICKED UP") ||
  status.includes("IN TRANSIT") ||
  status.includes("OUT FOR DELIVERY") ||
  status.includes("SHIPPED")
) {
  order.orderStatus = "SHIPPED";
}

else if (status.includes("DELIVERED")) {
  order.orderStatus = "DELIVERED";
}

else if (
  status.includes("CANCELLED") ||
  status.includes("CANCELED") ||
  status.includes("ORDER CANCELLED") ||
  status.includes("SHIPMENT CANCELLED")
) {
  order.orderStatus = "CANCELLED";
  order.shiprocket.trackingStatus = "Cancelled";
}

else if (status.includes("RTO")) {
  order.orderStatus = "CANCELLED";
  order.shiprocket.trackingStatus = current_status;
}

    await order.save();

    console.log(
      `✅ Order ${order.orderId} updated (${current_status})`
    );

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


