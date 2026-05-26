const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');

// HOME PAGE
router.get('/', async (req, res) => {
  try {
    const featured = await Product.find({ isFeatured: true, isAvailable: true }).limit(8);
    const categories = await Product.distinct('category', { isAvailable: true });
    const totalProducts = await Product.countDocuments({ isAvailable: true });
    res.render('index', {
      featured,
      categories,
      totalProducts,
      flash: req.flash()
    });
  } catch (err) {
    console.error(err);
    res.render('index', { featured: [], categories: [], totalProducts: 0, flash: {} });
  }
});

// PRODUCTS PAGE
router.get('/products', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = { isAvailable: true };
    if (category && category !== 'All') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { 'variants.0.price': 1 };
    if (sort === 'price-desc') sortOption = { 'variants.0.price': -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const products = await Product.find(query).sort(sortOption);
    const categories = await Product.distinct('category', { isAvailable: true });
    res.render('products', {
      products,
      categories,
      currentCategory: category || 'All',
      search: search || '',
      sort: sort || '',
      flash: req.flash()
    });
  } catch (err) {
    console.error(err);
    res.render('products', { products: [], categories: [], currentCategory: 'All', search: '', sort: '', flash: {} });
  }
});

// SINGLE PRODUCT
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect('/products');
    const related = await Product.find({ category: product.category, _id: { $ne: product._id }, isAvailable: true }).limit(4);
    res.render('product-detail', { product, related, flash: req.flash() });
  } catch (err) {
    res.redirect('/products');
  }
});

// CONTACT / INQUIRY PAGE
router.get('/contact', (req, res) => {
  res.render('contact', { flash: req.flash() });
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message, type } = req.body;
    if (!name || !email || !phone || !subject || !message) {
      req.flash('error', 'All fields are required!');
      return res.redirect('/contact');
    }
    await Inquiry.create({ name, email, phone, subject, message, type: type || 'General' });
    req.flash('success', '✅ Your inquiry has been submitted! We will contact you shortly.');
    res.redirect('/contact');
  } catch (err) {
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/contact');
  }
});

// ABOUT PAGE
router.get('/about', (req, res) => {
  res.render('about', { flash: req.flash() });
});

module.exports = router;
