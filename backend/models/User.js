const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  fullName: String,
  street: String,
  city: String,
  state: String,
  zip: String
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  googleId: String,
  address: {
    type: [addressSchema],
    default: [],
  },
  phoneNumber: {
    type: [String],
    default: [],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },

  
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }
  ],
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
