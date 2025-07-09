const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const Product = require('../models/Product');
const User = require('../models/User');
const nodemailer = require('nodemailer');


require('dotenv').config();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       
    pass: process.env.EMAIL_PASS,
  },
});


router.post('/add', async (req, res) => {
  try {
    const { title, description, imageUrl, productName, discount } = req.body;

    
    const product = await Product.findOne({ name: productName });
    if (!product) {
      return res.status(404).json({ error: 'Product not found with name: ' + productName });
    }

    
    const offer = new Offer({
      title,
      description,
      imageUrl,
      discount,
      productLink: `/product/${product._id}`,
    });
    await offer.save();

    
    const users = await User.find({}, 'email');
    const emails = users.map((u) => u.email);

    
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: emails,
      subject: `🎉 New Offer: ${title}`,
      html: `
        <h2>${title}</h2>
        <p>${description}</p>
        <p><strong>Discount:</strong> ${discount}</p>
        <a href="${process.env.FRONTEND_URL}${offer.productLink}">👉 View Product</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Offer created and email sent to users', offer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
