const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const getWebsiteReply = require('../utils/websiteReplies');
require('dotenv').config();

router.post('/', async (req, res) => {
  try {
    const userMessage = (req.body.message || "").trim();
    const token = req.headers.authorization?.split(' ')[1];

    let isLoggedIn = false;
    let userId = null;

    // Check Login
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        isLoggedIn = true;
      } catch {
        isLoggedIn = false;
      }
    }

    // Detect support related queries
    const needsTicket =
      /refund|problem|issue|not delivered|damaged|return|cancel|payment|replace|wrong product|late delivery|broken|missing|help/i.test(
        userMessage.toLowerCase()
      );

    // Website predefined replies
    const predefinedReply = getWebsiteReply(
      userMessage,
      isLoggedIn,
      userId
    );

    if (predefinedReply) {
      return res.json({
        success: true,
        reply: predefinedReply,
        askToRaiseTicket: needsTicket,
      });
    }

    // Default fallback response (No AI)
    return res.json({
      success: true,
      reply:
        "I'm sorry, I couldn't understand that.\n\nI can help you with:\n\n🛒 Products\n📦 Orders\n💳 Payments\n🚚 Delivery\n🎫 Support Tickets\n📞 Contact Information\n\nPlease try asking your question in a different way.",
      askToRaiseTicket: needsTicket,
    });
  } catch (error) {
    console.error("Chatbot Error:", error);

    return res.status(500).json({
      success: false,
      reply: "Something went wrong. Please try again later.",
      askToRaiseTicket: false,
    });
  }
});

module.exports = router;

