const mongoose = require ('mongoose'); 
const orderSchema = new mongoose.Schema({ 
  orderId: { type: String, required: true, unique: true, }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  items: [ { 
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, 
    name: { type: String }, description: { type: String }, mrp: { type: Number }, 
    discount: { type: Number }, price: { type: Number, required: true }, 
    images: [{ type: String }], category: { type: String }, unit: { type: String }, 
    ingredients: { type: String }, nutritionalInfo: { type: String }, 
    quantity: { type: Number, required: true }, inStock: { type: Boolean, default: true }, } ], 
    totalPrice: { type: Number, required: true }, address: { fullName: String, street: String, city: String, state: String, zip: String, }, 
    phone: { type: String, required: true }, paymentMethod: { type: String, enum: ['ONLINE', 'COD'], default: 'ONLINE', }, 
   paymentStatus: {
  type: String,
  enum: ["PENDING", "PAID", "FAILED"],
  default: "PENDING",
},
refund: {
  status: {
    type: String,
    enum: [
      "NOT_REQUIRED",
      "PROCESSING",
      "COMPLETED",
      "FAILED",
    ],
    default: "NOT_REQUIRED",
  },

  refundId: {
    type: String,
    default: "",
  },

  refundedAt: Date,
},
    orderStatus: { type: String, enum: ['PLACED', 'SHIPPED', 'DELIVERED', 'CANCELLED','PENDING'], default: 'PENDING', }, 
    placedAt: { type: Date }, 
    razorpayOrderId: { type: String, }, 
    razorpayPaymentId: { type: String, }, 
    razorpaySignature: { type: String, }, 
    couponCode: { type: String, default: "", }, 
    discount: { type: Number, default: 0, },
    gst: { type: Number, default: 0,}, 
    taxableAmount: { type: Number, default: 0,},
    finalAmount: { type: Number, }, 
    paidAt: { type: Date, }, 
    shipping: {
  charge: {
    type: Number,
    default: 0,
  },

  courier: {
    type: String,
    default: "",
  },

  estimatedDelivery: {
    type: String,
    default: "",
  },
},
    shiprocket: { orderId: { type: String, default: "", }, 
    shipmentId: { type: String, default: "", }, 
    awbCode: { type: String, default: "", }, 
    courierName: { type: String, default: "", }, 
    trackingUrl: { type: String, default: "", }, 
    trackingStatus: { type: String, default: "", }, },
    reviewEmailSent: {
  type: Boolean,
  default: false,
},
   }, { timestamps: true }); 
module.exports = mongoose.model('Order', orderSchema);





