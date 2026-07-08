const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const { createShiprocketOrder } = require("../services/shiprocketService");

const router = express.Router();

router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const response = await createShiprocketOrder(order);

    return res.status(200).json({
      success: true,
      message: "Shiprocket order created successfully.",
      shiprocket: order.shiprocket,
      response,
    });

  } catch (error) {

    console.error(
      "❌ Shiprocket Route Error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });

  }
});

module.exports = router;


