const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = process.env.JWT_SECRET;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


const googleLogin = async (req, res) => {
  console.log('Google login route hit');
  const { token } = req.body; // frontend se yahi milega
   
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('Google payload:', payload);

    if (!payload.email_verified) {
      return res.status(401).json({ success: false, message: 'Google email not verified' });
    }

    const { email, name, sub: googleId } = payload;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        password: null,
      });
    }
    const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({
      success: true,
      token: jwtToken,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
};

const checkUser = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    return res.json({
      exists: !!existingUser,
    });
  } catch (error) {
    console.error("Check user error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};


const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);

    res.status(401).json({
      message: "Invalid token or unauthorized",
    });
  }
};


const changePassword = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    const token = authHeader?.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);

    const { oldPassword, newPassword } = req.body;

    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(oldPassword, user.password))
    ) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(400).json({
        message: "Cannot reset password for this user",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { register,login,googleLogin,checkUser,getCurrentUser,changePassword,resetPassword,};