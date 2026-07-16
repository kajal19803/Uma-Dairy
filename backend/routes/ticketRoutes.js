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
      console.log("========== NEW TICKET ==========");
      console.log("User:", req.user);

      const { issueType, message, orderId, productNames } = req.body;
      const userId = req.user.id;

      console.log("Body:", req.body);

      if (!issueType || !message) {
        return res.status(400).json({
          error: "Issue type and message are required.",
        });
      }

      // Multer Debug
      console.log("Uploaded Files:", req.files);

      const images = (req.files || []).map((file) => {
        console.log("Original Name:", file.originalname);
        console.log("Saved Filename:", file.filename);
        console.log("Saved Path:", file.path);
        console.log("Destination:", file.destination);

        return `/ticket_uploads/${file.filename}`;
      });

      console.log("Images Array:", images);

      const ticketNumber = `TCK-${uuidv4()
        .split("-")[0]
        .toUpperCase()}`;

      const parsedProductNames = productNames
        ? JSON.parse(productNames)
        : [];

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

      console.log("Saved Ticket ID:", savedTicket._id);
      console.log("Saved Images:", savedTicket.images);

      await sendTicketMail({
        to: req.user.email,
        ticketNumber: savedTicket.ticketNumber,
        issueType: savedTicket.issueType,
        message: savedTicket.message,
      });

      console.log("✅ Ticket confirmation email sent");

      res.status(201).json({
        success: true,
        message: "Ticket created successfully.",
        ticketNumber: savedTicket.ticketNumber,
      });

    } catch (error) {
      console.error("🎫 Ticket creation error:", error);
      res.status(500).json({
        error: "Server error. Please try again later.",
      });
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

