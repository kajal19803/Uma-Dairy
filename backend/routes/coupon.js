const express = require("express");
const router = express.Router();

const Coupon = require("../models/couponSchema");

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
    const { code, totalAmount } = req.body;

    if (!code || totalAmount == null) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and total amount are required.",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    });

    // Coupon exists?
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code.",
      });
    }

    // Active?
    if (!coupon.active) {
      return res.status(400).json({
        success: false,
        message: "This coupon is currently inactive.",
      });
    }

    // Expired?
    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired.",
      });
    }

    // Minimum order amount
    if (totalAmount < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value should be ₹${coupon.minOrderValue}`,
      });
    }

    let discount = 0;

    // Flat Discount
    if (coupon.discountType === "FLAT") {
      discount = coupon.discountValue;
    }

    // Percentage Discount
    if (coupon.discountType === "PERCENTAGE") {
      discount = (totalAmount * coupon.discountValue) / 100;

      // Max discount cap
      if (
        coupon.maxDiscount > 0 &&
        discount > coupon.maxDiscount
      ) {
        discount = coupon.maxDiscount;
      }
    }

    // Discount cannot exceed order amount
    if (discount > totalAmount) {
      discount = totalAmount;
    }

    const finalAmount = totalAmount - discount;

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully.",

      coupon: {
        code: coupon.code,
        description: coupon.description,
      },

      totalAmount,

      discount,

      finalAmount,
    });

  } catch (error) {
    console.error("Coupon Apply Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to apply coupon.",
    });
  }
});

module.exports = router;