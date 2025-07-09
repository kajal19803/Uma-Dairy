const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

const otpStore = new Map(); 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


router.post('/send', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000); 
  otpStore.set(email, otp);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    
    setTimeout(() => otpStore.delete(email), 5 * 60 * 1000);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});


router.post('/verify', (req, res) => {
  const { email, otp } = req.body;

  const storedOtp = otpStore.get(email);
  if (!storedOtp) {
    return res.status(400).json({ message: 'OTP expired or not found' });
  }

  if (parseInt(otp) === storedOtp) {
    otpStore.delete(email);
    return res.json({ message: 'OTP verified successfully' });
  }

  res.status(400).json({ message: 'Invalid OTP' });
});

module.exports = router;


