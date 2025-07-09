const express = require('express');
const { register, login, googleLogin } = require('../controllers/auth');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error('Authorization header missing');
  const token = authHeader.split(' ')[1];
  if (!token) throw new Error('Token missing');
  return jwt.verify(token, JWT_SECRET);
};


router.put('/update-contact' ,async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: 'Authorization header missing' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { phoneNumbers, addresses } = req.body;

    if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return res.status(400).json({ message: 'At least one phone number required' });
    }

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ message: 'At least one address required' });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    
    user.phoneNumber = [...new Set([...(user.phoneNumber || []), ...phoneNumbers])];

    const existingAddresses = user.address?.map(addr => JSON.stringify(addr)) || [];
    const newAddresses = addresses
      .map(addr => JSON.stringify(addr))
      .filter(addr => !existingAddresses.includes(addr))
      .map(addr => JSON.parse(addr));

    user.address = [...(user.address || []), ...newAddresses];

    await user.save();
    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;

    res.json({ message: 'Contact info updated', user: sanitizedUser });
  } catch (err) {
    console.error('Update contact error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/remove-phone', authMiddleware , async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const { phone } = req.body;

    if (!phone) return res.status(400).json({ message: 'Phone number required' });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.phoneNumber = user.phoneNumber.filter(p => p !== phone);
    await user.save();

    res.json({ message: 'Phone number removed', phoneNumber: user.phoneNumber });
  } catch (err) {
    console.error('Remove phone error:', err);
    res.status(401).json({ message: err.message || 'Unauthorized' });
  }
});


router.delete('/remove-address', authMiddleware , async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const { addressToRemove } = req.body;

    if (!addressToRemove || typeof addressToRemove !== 'object') {
      return res.status(400).json({ message: 'Address object required' });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.address = user.address.filter(
      addr => JSON.stringify(addr) !== JSON.stringify(addressToRemove)
    );

    await user.save();
    res.json({ message: 'Address removed', address: user.address });
  } catch (err) {
    console.error('Remove address error:', err);
    res.status(401).json({ message: err.message || 'Unauthorized' });
  }
});
router.post('/wishlist/add', authMiddleware , async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
  } catch (err) {
    console.error('Add to wishlist error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
 router.post('/wishlist/remove', authMiddleware, async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.wishlist = user.wishlist.filter(
      id => id.toString() !== productId
    );

    await user.save();

    res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/wishlist', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});


module.exports = router;
