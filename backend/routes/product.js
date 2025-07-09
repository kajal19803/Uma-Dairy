const express = require('express');
const router = express.Router();
const multer = require('multer');

const Product = require('../models/Product');

const storage = multer.diskStorage({
  destination: ( cb ) => {
    cb(null, 'public/uploads/');
  },
  filename: ( cb ) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post('/add', upload.array('images', 5), async (req, res) => {
  try {
    const {
      name,
      description,
      mrp,
      discount,
      inStock,
      category,
      unit,
      ingredients,
      nutritionalInfo,
    } = req.body;

    const price = mrp - (mrp * discount) / 100;
    const imagePaths = Array.isArray(req.files)
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];

    const newProduct = new Product({
      name,
      description,
      mrp,
      discount,
      price,
      unit,
      ingredients,
      nutritionalInfo,
      inStock: inStock === 'true',
      category,
      images: imagePaths,
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ message: 'Failed to add product' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { name, category, unit, inStock, minPrice, maxPrice, discounted } = req.query;

    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    if (unit) {
      filter.unit = unit;
    }

    if (inStock === 'true') {
      filter.inStock = true;
    } else if (inStock === 'false') {
      filter.inStock = false;
    }

    if (minPrice && maxPrice) {
      filter.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    } else if (minPrice) {
      filter.price = { $gte: Number(minPrice) };
    } else if (maxPrice) {
      filter.price = { $lte: Number(maxPrice) };
    }

    if (discounted === 'true') {
      filter.discount = { $gt: 0 };
    }
    console.log('🧪 Filter applied:', filter);

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/related/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const mainProduct = await Product.findById(productId);
    if (!mainProduct) return res.status(404).json({ message: 'Product not found' });

    const relatedProducts = await Product.find({
      category: mainProduct.category,
      _id: { $ne: productId },
    }).limit(6);

    res.json(relatedProducts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
