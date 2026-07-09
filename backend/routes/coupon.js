const express = require("express");
const router = express.Router();

const Coupon = require("../models/couponSchema");
const {
  calculateSubtotal,
  applyCoupon,
  calculateGST,
} = require("../services/orderCalculationService");

// ==============================
// Create Coupon
// ==============================

router.post("/create", async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      expiryDate,
      usageLimit,
      firstOrderOnly,
      applicableCategories,
      applicableProducts,
    } = req.body;

    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon already exists",
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      expiryDate,
      usageLimit,
      firstOrderOnly,
      applicableCategories,
      applicableProducts,
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
    });
  }
});


// ==============================
// Get All Coupons
// ==============================

router.get("/", async (req, res) => {
  try {

    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      coupons,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });

  }
});


// ==============================
// Delete Coupon
// ==============================

router.delete("/:id", async (req, res) => {
  try {

    await Coupon.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Coupon deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Delete failed",
    });

  }
});


// ==============================
// Enable / Disable Coupon
// ==============================

router.patch("/:id/toggle", async (req, res) => {

  try {

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    coupon.active = !coupon.active;

    await coupon.save();

    res.json({
      success: true,
      coupon,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed",
    });

  }

});
// ==============================
// Apply Coupon
// ==============================

router.post("/apply", async (req, res) => {
  try {
    const { code, items } = req.body;

    if (!code || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and items are required.",
      });
    }

    // Calculate subtotal from DB
    const { subtotal } = await calculateSubtotal(items);

    // Apply coupon
    const {
      discount,
      appliedCoupon,
    } = await applyCoupon(code, subtotal);

    // GST
    const {
      taxableAmount,
      gst,
    } = calculateGST(subtotal, discount);

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully.",

      coupon: {
        code: appliedCoupon,
      },

      subtotal,
      discount,
      gst,
      taxableAmount,
    });

  } catch (error) {

    console.error("Coupon Apply Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
});

module.exports = router;