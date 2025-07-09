const express = require('express');
const multer = require('multer');
const path = require ('path');
const Ticket = require('../models/Ticket');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/authMiddleware');
const sendTicketMail = require('../utils/sendTicketMail');

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/ticket_uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({ storage });


router.post(
  '/',
  authMiddleware,
  upload.array('images', 5),
  async (req, res) => {
    try {
      const { issueType, message, orderId, productNames } = req.body;
      const userId = req.user.id;

      if (!issueType || !message) {
        return res.status(400).json({ error: 'Issue type and message are required.' });
      }

      const images = req.files.map((file) => `/ticket_uploads/${file.filename}`);
      const ticketNumber = `TCK-${uuidv4().split('-')[0].toUpperCase()}`;

      const parsedProductNames = productNames ? JSON.parse(productNames) : [];

      const newTicket = new Ticket({
        user: userId,
        issueType,
        message,
        images,
        ticketNumber,
        orderId: orderId || undefined,
        productNames: parsedProductNames,
      });

     
      const savedTicket = await newTicket.save();

      
      await sendTicketMail({
        to: req.user.email,
        ticketNumber: savedTicket.ticketNumber,
        issueType: savedTicket.issueType,
        message: savedTicket.message,
      });

      
      res.status(201).json({
        success: true,
        message: 'Ticket created successfully.',
        ticketNumber: savedTicket.ticketNumber,
      });

    } catch (error) {
      console.error('🎫 Ticket creation error:', error.message);
      res.status(500).json({ error: 'Server error. Please try again later.' });
    }
  }
);


router.get('/my-tickets', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 Fetching tickets for:', userId);

    const tickets = await Ticket.find({ user: userId }).sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    console.error('❌ Error fetching tickets:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

module.exports = router;

