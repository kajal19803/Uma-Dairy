const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const { getShippingCharge } = require("../services/DeliveryService");

// =====================================
// Get Delivery Charges
// =====================================

router.post("/charge", authMiddleware, async (req, res) => {
  try {
    const {
      deliveryPincode,
      paymentMethod,
      weight,
    } = req.body;

    if (!deliveryPincode) {
      return res.status(400).json({
        success: false,
        message: "Delivery pincode is required",
      });
    }

    const result = await getShippingCharge({
      deliveryPincode,
      paymentMethod,
      weight,
    });

    return res.status(200).json(result);

  } catch (err) {

    console.error(
      "❌ Delivery Charge Error:",
      err.response?.data || err.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to calculate delivery charges",
    });

  }
});

module.exports = router;
