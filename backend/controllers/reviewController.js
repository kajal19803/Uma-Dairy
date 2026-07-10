const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { generateReviewToken } = require("../utils/reviewToken");
const { verifyReviewToken } = require("../utils/reviewToken");

// =====================================
// Create / Update Review
// =====================================

const saveReview = async (req, res) => {
  try {

    const { token, reviews } = req.body;

    if (!token || !Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    // ==========================
    // Verify Token
    // ==========================

    let decoded;

    try {
      decoded = verifyReviewToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Review link expired or invalid",
      });
    }

    // ==========================
    // Find Order
    // ==========================

    const order = await Order.findById(decoded.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.userId.toString() !== decoded.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (order.orderStatus !== "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Order not delivered",
      });
    }

    // ==========================
    // Save / Update Reviews
    // ==========================

    for (const review of reviews) {

      const exists = order.items.some(
        (item) =>
          item.productId.toString() === review.productId
      );

      if (!exists) {
        continue;
      }

      if (
        review.rating < 1 ||
        review.rating > 5
      ) {
        continue;
      }

      await Review.findOneAndUpdate(

        {
          userId: order.userId,
          orderId: order._id,
          productId: review.productId,
        },

        {
          rating: review.rating,
        },

        {
          upsert: true,
          new: true,
        }

      );
    }

    // ==========================
    // Recalculate Product Ratings
    // ==========================

    const uniqueProducts = [
      ...new Set(
        reviews.map((r) => r.productId)
      ),
    ];

    for (const productId of uniqueProducts) {

      const productReviews = await Review.find({
        productId,
      });

      const totalRatings = productReviews.length;

      const averageRating =
        totalRatings === 0
          ? 0
          : productReviews.reduce(
              (sum, item) => sum + item.rating,
              0
            ) / totalRatings;

      await Product.findByIdAndUpdate(
        productId,
        {
          rating: Number(
            averageRating.toFixed(1)
          ),
          numRatings: totalRatings,
        }
      );
    }

    return res.json({
      success: true,
      message: "Reviews submitted successfully",
    });

  } catch (err) {

    console.error("Save Review Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
};

// =====================================
// Get Product Reviews
// =====================================

const getProductReviews = async (req, res) => {
  try {

    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const reviews = await Review.find({
      productId,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    const formattedReviews = reviews.map((review) => ({
      userName: review.userId?.name || "Anonymous",
      rating: review.rating,
      createdAt: review.createdAt,
    }));

    return res.json({
      success: true,

      averageRating: product.rating,

      numRatings: product.numRatings,

      reviews: formattedReviews,
    });

  } catch (err) {

    console.error("Get Reviews Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
};
// =====================================
// Verify Review Link
// =====================================

const verifyReviewLink = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Review token is required",
      });
    }

    // =============================
    // Verify Token
    // =============================

    let decoded;

    try {
      decoded = verifyReviewToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Review link is invalid or expired.",
      });
    }

    // =============================
    // Find Order
    // =============================

    const order = await Order.findById(decoded.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // =============================
    // Verify User
    // =============================

    if (order.userId.toString() !== decoded.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // =============================
    // Delivered Check
    // =============================

    if (order.orderStatus !== "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Order has not been delivered yet.",
      });
    }

    // =============================
    // Existing Reviews
    // =============================

    const existingReviews = await Review.find({
      orderId: order._id,
      userId: order.userId,
    });

    const ratedProducts = {};

    existingReviews.forEach((review) => {
      ratedProducts[review.productId.toString()] = review.rating;
    });

    // =============================
    // Prepare Products
    // =============================

    const products = order.items.map((item) => ({
      productId: item.productId.toString(),

      name: item.name,

      image:
        item.images && item.images.length > 0
          ? item.images[0]
          : "",

      quantity: item.quantity,

      alreadyRated:
        !!ratedProducts[item.productId.toString()],

      rating:
        ratedProducts[item.productId.toString()] || 0,
    }));

    return res.json({
      success: true,

      orderId: order._id.toString(),

      products,
    });

  } catch (err) {
    console.error("Verify Review Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


module.exports = {
  saveReview,
  getProductReviews,
  verifyReviewLink,
};