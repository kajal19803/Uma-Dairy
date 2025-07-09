const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  discount: String,
  productLink: String,
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);

