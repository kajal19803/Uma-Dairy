const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authMiddleware } = require('../middleware/authMiddleware');
const axios = require('axios');
require('dotenv').config();
const Product = require('../models/Product');

// 📦 1. Place Order Route

router.post('/', authMiddleware , async (req, res) => {
  try {
    const { items, address, totalPrice, phone } = req.body;
    
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || !address || !totalPrice || !phone) {
      return res.status(400).json({ message: 'Missing or invalid order details' });
    }

    // ✅ Enrich items with full product details from DB
    const finalItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item._id);

        if (!product) {
          return {
            productId: item._id,
            name: 'Deleted Product',
            description: '',
            mrp: 0,
            discount: 0,
            price: 0,
            images: [],
            category: '',
            unit: '',
            ingredients: '',
            nutritionalInfo: '',
            quantity: item.quantity,
            inStock: false,
          };
        }

        return {
          productId: product._id,
          name: product.name,
          description: product.description,
          mrp: product.mrp,
          discount: product.discount,
          price: product.price,
          images: product.images,
          category: product.category,
          unit: product.unit,
          ingredients: product.ingredients,
          nutritionalInfo: product.nutritionalInfo,
          quantity: item.quantity,
          inStock: true,
        };
      })
    );

    const orderId = `ORDER_${Date.now()}`;
    const newOrder = new Order({
      orderId,
      userId,
      items: finalItems,
      address,
      totalPrice,
      phone,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
    });
    const savedOrder = await newOrder.save();
    
    res.status(201).json({
       message: 'Order placed successfully',
       order: {
       orderId: savedOrder.orderId,
       totalPrice: savedOrder.totalPrice,
       items: finalItems,
       address: savedOrder.address,
       phone: savedOrder.phone,
       paymentStatus: savedOrder.paymentStatus,
       orderStatus: savedOrder.orderStatus,
       createdAt: savedOrder.createdAt,
       },
    });

  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/payment/create-link', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { amount, phone, email, name, orderId: providedOrderId } = req.body;

    if (!user || !user._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const orderId = providedOrderId || `order_${Date.now()}`;
    const url = 'https://api.cashfree.com/pg/orders';

    const data = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: 'INR',
      order_note: 'Dairy product purchase',
      customer_details: {
        customer_id: user._id.toString(),
        customer_email: email || user.email || 'test@example.com',
        customer_phone: phone?.toString() || user.phone?.toString() || '0000000000',
        customer_name: name || 'Customer',
      },
      order_meta: {
        notify_url: `${process.env.BACKEND_BASE_URL}/webhook/cashfree`,
        
      },
    };

    const headers = {
      'x-client-id': process.env.CASHFREE_APP_ID,
      'x-client-secret': process.env.CASHFREE_SECRET,
      'x-api-version': '2025-01-01',
      'Content-Type': 'application/json',
    };

    const response = await axios.post(url, data, { headers });

    const sessionId = response.data.payment_session_id;

    if (!sessionId) {
      return res.status(500).json({
        error: 'Cashfree did not return a session ID',
        raw: response.data,
      });
    }

    res.status(200).json({ session_id: sessionId, orderId });
  } catch (error) {
    const errData = error.response?.data || error.message;
    console.error('❌ Cashfree error:', errData);
    res.status(500).json({ error: 'Failed to create payment session', details: errData });
  }
});

router.post('/place-cod', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log(orderId);
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order belongs to the logged-in user
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized access to this order' });
    }

    // Check if already paid or already confirmed
    if (order.paymentStatus === 'PAID' || order.orderStatus === 'PLACED') {
      return res.status(400).json({ error: 'Order already confirmed or paid' });
    }

    // Update order for COD
    order.paymentMethod = 'COD';
    order.paymentStatus = 'PENDING';
    order.orderStatus = 'PLACED';
    order.placedAt = new Date();

    await order.save();

    res.status(200).json({ success: true, message: 'COD order placed successfully' });
  } catch (error) {
    console.error('❌ Error placing COD order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
