const express = require('express');
const axios = require('axios');
const getShiprocketToken = require('../utils/getShiprocketToken');
const { authMiddleware } = require('../middleware/authMiddleware');
const Order = require('../models/Order'); 

const router = express.Router();

router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const token = await getShiprocketToken();

    
    const order = await Order.findOne({ orderId: req.body.orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    
    const orderData = {
      order_id: order._id.toString(),
      order_date: new Date(order.createdAt || Date.now()).toISOString(),
      pickup_location: "Jabalpur Warehouse",

      billing_customer_name: order.name || "Customer",
      billing_address: order.address?.street || "Default Address",
      billing_city: order.address?.city || "City",
      billing_state: order.address?.state || "MP",
      billing_pincode: order.address?.pincode || "482009",
      billing_country: "India",
      billing_phone: order.phoneNumber || "0000000000",


      order_items: order.items.map((item) => ({
        name: item.name,
        sku: item.productId || item.name.replace(/\s/g, '_'),
        units: item.quantity,
        selling_price: item.price,
      })),

      payment_method: order.paymentMode === 'COD' ? 'COD' : 'Prepaid',
      sub_total: order.totalAmount,
    };

    // ✅ 3. Uncomment this when you're ready to send real request
    /*
    const response = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.json(response.data);
    */

    // ✅ Testing-only response (no real API call yet)
    return res.json({ message: 'Shiprocket payload ready (not sent)', data: orderData });

  } catch (error) {
    console.error("🚫 Error creating Shiprocket order:", error.response?.data || error.message);
    return res.status(500).json({ error: 'Shiprocket order creation failed' });
  }
});

module.exports = router;


