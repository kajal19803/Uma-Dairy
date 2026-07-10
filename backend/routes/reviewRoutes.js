const express = require("express");

const router = express.Router();

const {
  saveReview,
  getProductReviews,
  verifyReviewLink,
} = require("../controllers/reviewController");
router.post("/", saveReview);

router.get("/product/:productId", getProductReviews);
router.get("/verify", verifyReviewLink);

module.exports = router;