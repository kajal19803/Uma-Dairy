const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  mrp: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  price: { type: Number, required: true },
  images: [String], // 
  category: { type: String },
  unit: { type: String }, // 
  ingredients: { type: String },
  nutritionalInfo: { type: String },
  inStock: { type: Boolean, default: true },
  rating: {type: Number,default: 0},
});

module.exports = mongoose.model ('Product', productSchema);
