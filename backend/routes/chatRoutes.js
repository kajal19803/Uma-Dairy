const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const getWebsiteReply = require('../utils/websiteReplies');
const { InferenceClient } = require('@huggingface/inference');
require('dotenv').config();

const hfClient = new InferenceClient(process.env.HUGGINGFACE_API_TOKEN);

router.post('/', async (req, res) => {
  const userMessage = req.body.message;
  const token = req.headers.authorization?.split(' ')[1];

  let isLoggedIn = false;
  let userId = null;

  // Check if user is logged in
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded?.id;
      isLoggedIn = !!userId;
    } catch {
      isLoggedIn = false;
    }
  }

  // Check if message is related to support issues
  const needsTicket = /refund|problem|issue|not delivered|damaged|return|cancel|payment/i.test(userMessage);

  // Try matching predefined website replies
  const predefinedReply = getWebsiteReply(userMessage);
  if (predefinedReply) {
    return res.json({
      reply: predefinedReply,
      askToRaiseTicket: needsTicket, // Will only prompt to raise ticket if needed
    });
  }

  // If no predefined reply, use HuggingFace
  try {
    const chatResponse = await hfClient.chatCompletion({
      model: 'HuggingFaceH4/zephyr-7b-beta', // Use Mixtral if needed
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const reply = chatResponse?.choices?.[0]?.message?.content?.trim() || 'Sorry, I couldn’t respond.';

    return res.json({
      reply,
      askToRaiseTicket: needsTicket, // Frontend will decide to show ticket UI or not
    });
  } catch (error) {
    console.error('🔴 HuggingFace API Error:', error.message);
    return res.status(500).json({ reply: 'Something went wrong. Try again later.' });
  }
});

module.exports = router;

