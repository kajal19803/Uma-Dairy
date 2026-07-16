const express = require('express');
const {
  register,
  login,
  googleLogin,
  checkUser,
  getCurrentUser,
  changePassword,
  resetPassword,
} = require('../controllers/auth');

const { authMiddleware } = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/check-user', checkUser);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/change-password', authMiddleware, changePassword);
router.post('/reset-password', resetPassword);


router.put('/update-contact', authMiddleware, async (req, res) => {
  try {
    const { phoneNumbers, addresses } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    let updated = false;

    // ================= PHONE =================

    if (Array.isArray(phoneNumbers)) {
      user.phoneNumber = [
        ...new Set([
          ...(user.phoneNumber || []),
          ...phoneNumbers.filter(Boolean),
        ]),
      ];

      updated = true;
    }

    // ================= ADDRESS =================

    if (Array.isArray(addresses)) {
      const existingAddresses = (user.address || []).map((addr) =>
        JSON.stringify(addr)
      );

      const newAddresses = addresses
        .filter(Boolean)
        .map((addr) => JSON.stringify(addr))
        .filter((addr) => !existingAddresses.includes(addr))
        .map((addr) => JSON.parse(addr));

      user.address = [...(user.address || []), ...newAddresses];

      updated = true;
    }

    if (!updated) {
      return res.status(400).json({
        message: 'Nothing to update',
      });
    }

    await user.save();

    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;

    return res.json({
      message: 'Contact info updated successfully',
      user: sanitizedUser,
    });
  } catch (err) {
    console.error('Update contact error:', err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
});

router.delete('/remove-phone', authMiddleware, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number required' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.phoneNumber = user.phoneNumber.filter((p) => p !== phone);
    await user.save();

    return res.json({
      message: 'Phone number removed',
      phoneNumber: user.phoneNumber,
    });
  } catch (err) {
    console.error('Remove phone error:', err);
    return res.status(401).json({
      message: err.message || 'Unauthorized',
    });
  }
});


router.delete('/remove-address', authMiddleware, async (req, res) => {
  try {
    const { addressToRemove } = req.body;

    if (!addressToRemove || typeof addressToRemove !== 'object') {
      return res.status(400).json({
        message: 'Address object required',
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    user.address = user.address.filter(
      (addr) => JSON.stringify(addr) !== JSON.stringify(addressToRemove)
    );

    await user.save();

    return res.json({
      message: 'Address removed',
      address: user.address,
    });
  } catch (err) {
    console.error('Remove address error:', err);
    return res.status(401).json({
      message: err.message || 'Unauthorized',
    });
  }
});

router.post('/wishlist/add', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: 'Product ID required',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        message: 'Product already in wishlist',
      });
    }

    user.wishlist.push(productId);
    await user.save();

    return res.json({
      message: 'Added to wishlist',
      wishlist: user.wishlist,
    });
  } catch (err) {
    console.error('Add to wishlist error:', err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
});

router.post('/wishlist/remove', authMiddleware, async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({
      message: 'Product ID is required',
    });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    return res.json({
      message: 'Removed from wishlist',
      wishlist: user.wishlist,
    });
  } catch (err) {
    console.error('Remove wishlist error:', err);

    return res.status(500).json({
      message: 'Server error',
    });
  }
});

router.get('/wishlist', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');

    return res.json({
      wishlist: user.wishlist,
    });
  } catch (err) {
    console.error('Fetch wishlist error:', err);

    return res.status(500).json({
      message: 'Error fetching wishlist',
    });
  }
});


module.exports = router;
