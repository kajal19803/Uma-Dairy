const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const getWebsiteReply = require('../utils/websiteReplies');
require('dotenv').config();

router.post('/', async (req, res) => {
  const userMessage = req.body.message;
  const token = req.headers.authorization?.split(' ')[1];

  let isLoggedIn = false;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      isLoggedIn = !!decoded?.id;
    } catch (err) {
      isLoggedIn = false; 
    }
  }

  const needsTicket = /refund|problem|issue|not delivered|damaged|return|cancel|payment/i.test(userMessage);
  const predefinedReply = getWebsiteReply(userMessage);

  
  if (predefinedReply) {
    if (needsTicket) {
      if (!isLoggedIn) {
        return res.json({
          reply: '⚠️ Please login to raise a support ticket.',
          askToRaiseTicket: false,
        });
      }

      return res.json({
        reply: predefinedReply,
        askToRaiseTicket: true,
      });
    }

    return res.json({ reply: predefinedReply });
  }

  
  const headers = {
    Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const body = {
    inputs: `<s>[INST] Reply shortly and simply in 2-3 lines: ${userMessage} [/INST]`,
  };

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
      body,
      { headers }
    );

    const rawReply = response.data[0]?.generated_text || 'Sorry, I couldn’t respond.';
    const cleanReply = rawReply
      .replace(/<[^>]*>/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    if (needsTicket) {
      if (!isLoggedIn) {
        return res.json({
          reply: 'Please login to raise a support ticket.',
          askToRaiseTicket: false,
        });
      }

      return res.json({
        reply: cleanReply,
        askToRaiseTicket: true,
      });
    }

    res.json({ reply: cleanReply });
  } catch (error) {
    console.error(' HuggingFace API Error:', error.message);
    res.status(500).json({ reply: 'Something went wrong. Try again later.' });
  }
});

module.exports = router;
