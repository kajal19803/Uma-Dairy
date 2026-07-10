const jwt = require("jsonwebtoken");

const REVIEW_SECRET = process.env.REVIEW_JWT_SECRET;

// ==============================
// Generate Review Token
// ==============================

const generateReviewToken = (orderId, userId) => {
  return jwt.sign(
    {
      orderId,
      userId,
    },
    REVIEW_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

// ==============================
// Verify Review Token
// ==============================

const verifyReviewToken = (token) => {
  return jwt.verify(token, REVIEW_SECRET);
};

module.exports = {
  generateReviewToken,
  verifyReviewToken,
};