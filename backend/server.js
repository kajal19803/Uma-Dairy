const express = require('express');
const cors = require ( 'cors');
require('dotenv').config();
const mongoose = require ('mongoose');
const path = require('path');
const emailOtpRoute = require('./routes/emailOtp');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const offerRoutes = require('./routes/offer');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const shiprocketRoutes = require('./routes/shiprocketRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const cartRoutes = require('./routes/cartRoutes');
const couponRoutes = require("./routes/coupon");
const deliveryRoutes = require("./routes/deliveryRoutes");
const razorpayWebhookRoutes = require("./routes/razorpayWebhookRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
}));

// Razorpay webhook (raw body)
app.use(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhookRoutes
);

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(
  '/ticket_uploads',
  express.static(path.join(__dirname, 'public/ticket_uploads'))
);
app.use('/webhook', webhookRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log(' MongoDB connected'))
.catch(err => console.error(' MongoDB connection error:', err));


app.get('/', (req, res) => {
  res.send(' Backend is running');
});


app.use('/api/auth', authRoutes);
app.use('/api/email-otp', emailOtpRoute);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/shiprocket', shiprocketRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/reviews", reviewRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
