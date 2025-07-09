const jwt = require('jsonwebtoken'); 
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET;
const authMiddleware = async (req, res, next) => {
const authHeader = req.headers.authorization;
console.log("Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  console.log("Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decoded); 

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json ({ message: 'User not found' });
    }

    req.user = user;
    next();

  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};
const isAdmin = (req, res, next) => {
   if (req.user && req.user.isAdmin) {
    next();
  } else {
    console.log("User is not admin");
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};



module.exports = { authMiddleware, isAdmin };