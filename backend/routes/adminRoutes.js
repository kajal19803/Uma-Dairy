const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', authMiddleware, isAdmin, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    res.json({ ordersToday });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
