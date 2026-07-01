const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    street: String,
    city: String,
    state: String,
    zip: String,
  },
  { _id: false }
);

// ================= CART =================

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: String,

  googleId: String,

  // ================= ADDRESS =================

  address: {
    type: [addressSchema],
    default: [],
  },

  // ================= PHONE =================

  phoneNumber: {
    type: [String],
    default: [],
  },

  // ================= ADMIN =================

  isAdmin: {
    type: Boolean,
    default: false,
  },

  // ================= WISHLIST =================

  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],

  // ================= CART =================

  cart: {
    type: [cartItemSchema],
    default: [],
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
