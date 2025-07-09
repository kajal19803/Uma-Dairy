const express = require('express');
const crypto = require('crypto');
const { authMiddleware } = require ('../middleware/authMiddleware');
const Order = require('../models/Order');
require('dotenv').config();
const router = express.Router();


router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.productId');

    res.json({ orders });
  } catch (error) {
    console.error('❌ Error fetching my-orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// 🕒 Get 3 most recent orders for chatbot/ticket
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('_id items')
      .populate('items.productId', 'name');

    const formattedOrders = orders.map(order => ({
      orderId: order._id,
      productNames: order.items.map(item => item.productId?.name || 'Unknown Product'),
    }));

    res.json({ orders: formattedOrders });
  } catch (err) {
    console.error('❌ Error in /recent:', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

module.exports = router;

