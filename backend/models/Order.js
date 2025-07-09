const mongoose = require ('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String },                   
      description: { type: String },
      mrp: { type: Number },
      discount: { type: Number },
      price: { type: Number, required: true },
      images: [{ type: String }],
      category: { type: String },
      unit: { type: String },
      ingredients: { type: String },
      nutritionalInfo: { type: String },
      quantity: { type: Number, required: true },
      inStock: { type: Boolean, default: true },
    }
  ],

  totalPrice: { type: Number, required: true },

  address: {
    fullName: String,
    street: String,
    city: String,
    state: String,
    zip: String,
  },

  phone: { type: String, required: true },

  paymentMethod: {
    type: String,
    enum: ['ONLINE', 'COD'],
    default: 'ONLINE',
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'PENDING'],
    default: 'PENDING',
  },
  orderStatus: {
    type: String,
    enum: ['PLACED', 'SHIPPED', 'DELIVERED', 'CANCELLED','PENDING'],
    default: 'PENDING',
  },

  placedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);





