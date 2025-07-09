const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  issueType: {
    type: String,
    required: true,
    enum: [
      'Order Issue',
      'Payment & Refunds',
      'Product Issue',
      'Account & Login',
      'Website Bug/Technical Problem',
      'Request Related',
      'Other',
    ],
  },
  message: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    required: false, 
  },
  productNames: {
    type: [String],
    required: false,
  },
  images: [
    {
      type: String,
    },
  ],
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
