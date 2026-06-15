const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');
const { isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const isVercel = process.env.VERCEL || process.env.NOW_REGION;

// Helper: resolve image path/name from uploaded file
// On Vercel (memory storage): req.file.buffer exists, no filename → use placeholder
// Locally (disk storage): req.file.filename is set
function getImageName(file) {
  if (!file) return null;
  if (file.filename) return file.filename; // disk storage (local)
  // Memory storage on Vercel — we can't persist files; return a placeholder
  // In a production app you'd upload to Cloudinary here
  return 'default-product.jpg';
}

// LOGIN PAGE
router.get('/login', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin/dashboard');
  res.render('admin/login', { flash: req.flash() });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/admin/login');
    }
    req.session.adminId = admin._id;
    req.session.adminName = admin.name;
    req.flash('success', `Welcome back, ${admin.name}!`);
    res.redirect('/admin/dashboard');
  } catch (err) {
    req.flash('error', 'Login failed. Try again.');
    res.redirect('/admin/login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// DASHBOARD
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const availableProducts = await Product.countDocuments({ isAvailable: true });
    const totalInquiries = await Inquiry.countDocuments();
    const newInquiries = await Inquiry.countDocuments({ status: 'New' });
    const recentInquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(5);
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.render('admin/dashboard', {
      adminName: req.session.adminName,
      totalProducts, availableProducts, totalInquiries, newInquiries,
      recentInquiries, categoryStats,
      flash: req.flash()
    });
  } catch (err) {
    console.error(err);
    res.redirect('/admin/login');
  }
});

// PRODUCTS LIST
router.get('/products', isAdmin, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    const products = await Product.find(query).sort({ createdAt: -1 });
    const categories = await Product.distinct('category');
    res.render('admin/products', {
      adminName: req.session.adminName,
      products, categories,
      currentCategory: category || 'All',
      search: search || '',
      flash: req.flash()
    });
  } catch (err) {
    req.flash('error', 'Error loading products');
    res.redirect('/admin/dashboard');
  }
});

// ADD PRODUCT FORM
router.get('/products/new', isAdmin, (req, res) => {
  res.render('admin/product-form', {
    adminName: req.session.adminName,
    product: null,
    action: '/admin/products',
    method: 'POST',
    flash: req.flash()
  });
});

// CREATE PRODUCT
router.post('/products', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, badge, nutritionInfo, isAvailable, isFeatured } = req.body;
    const quantities = Array.isArray(req.body.quantity) ? req.body.quantity : [req.body.quantity];
    const prices = Array.isArray(req.body.price) ? req.body.price : [req.body.price];
    const variants = quantities.map((q, i) => ({ quantity: q, price: parseFloat(prices[i]) })).filter(v => v.quantity && !isNaN(v.price));

    const product = new Product({
      name, description, category, badge, nutritionInfo,
      variants,
      isAvailable: isAvailable === 'on',
      isFeatured: isFeatured === 'on',
      image: getImageName(req.file) || 'default-product.jpg'
    });
    await product.save();
    req.flash('success', `Product "${name}" added successfully!`);
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error adding product: ' + err.message);
    res.redirect('/admin/products/new');
  }
});

// EDIT PRODUCT FORM
router.get('/products/:id/edit', isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) { req.flash('error', 'Product not found'); return res.redirect('/admin/products'); }
    res.render('admin/product-form', {
      adminName: req.session.adminName,
      product,
      action: `/admin/products/${product._id}?_method=PUT`,
      method: 'POST',
      flash: req.flash()
    });
  } catch (err) {
    req.flash('error', 'Error loading product');
    res.redirect('/admin/products');
  }
});

// UPDATE PRODUCT
router.put('/products/:id', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, badge, nutritionInfo, isAvailable, isFeatured } = req.body;
    const quantities = Array.isArray(req.body.quantity) ? req.body.quantity : [req.body.quantity];
    const prices = Array.isArray(req.body.price) ? req.body.price : [req.body.price];
    const variants = quantities.map((q, i) => ({ quantity: q, price: parseFloat(prices[i]) })).filter(v => v.quantity && !isNaN(v.price));

    const product = await Product.findById(req.params.id);
    if (!product) { req.flash('error', 'Product not found'); return res.redirect('/admin/products'); }

    const oldImage = product.image;
    product.name = name; product.description = description;
    product.category = category; product.badge = badge;
    product.nutritionInfo = nutritionInfo; product.variants = variants;
    product.isAvailable = isAvailable === 'on';
    product.isFeatured = isFeatured === 'on';

    if (req.file) {
      const newImage = getImageName(req.file);
      if (newImage && newImage !== 'default-product.jpg') {
        product.image = newImage;
        // Only delete local disk files; Vercel has no stored files to clean up
        if (!isVercel && oldImage && oldImage !== 'default-product.jpg') {
          const oldPath = path.join(__dirname, '../public/uploads', oldImage);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }
    }
    await product.save();
    req.flash('success', `Product "${name}" updated successfully!`);
    res.redirect('/admin/products');
  } catch (err) {
    req.flash('error', 'Error updating product');
    res.redirect('/admin/products');
  }
});

// DELETE PRODUCT
router.delete('/products/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      if (!isVercel && product.image && product.image !== 'default-product.jpg') {
        const imgPath = path.join(__dirname, '../public/uploads', product.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }
      await Product.findByIdAndDelete(req.params.id);
      req.flash('success', 'Product deleted successfully!');
    }
    res.redirect('/admin/products');
  } catch (err) {
    req.flash('error', 'Error deleting product');
    res.redirect('/admin/products');
  }
});

// TOGGLE AVAILABILITY
router.post('/products/:id/toggle', isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) { product.isAvailable = !product.isAvailable; await product.save(); }
    res.json({ success: true, isAvailable: product.isAvailable });
  } catch (err) {
    res.json({ success: false });
  }
});

// INQUIRIES
router.get('/inquiries', isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    const inquiries = await Inquiry.find(query).sort({ createdAt: -1 });
    const counts = {
      all: await Inquiry.countDocuments(),
      new: await Inquiry.countDocuments({ status: 'New' }),
      inProgress: await Inquiry.countDocuments({ status: 'In Progress' }),
      resolved: await Inquiry.countDocuments({ status: 'Resolved' })
    };
    res.render('admin/inquiries', {
      adminName: req.session.adminName,
      inquiries, counts,
      currentStatus: status || 'All',
      flash: req.flash()
    });
  } catch (err) {
    req.flash('error', 'Error loading inquiries');
    res.redirect('/admin/dashboard');
  }
});

// UPDATE INQUIRY STATUS
router.post('/inquiries/:id/status', isAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    await Inquiry.findByIdAndUpdate(req.params.id, { status, adminNote });
    req.flash('success', 'Inquiry updated!');
    res.redirect('/admin/inquiries');
  } catch (err) {
    req.flash('error', 'Error updating inquiry');
    res.redirect('/admin/inquiries');
  }
});

// DELETE INQUIRY
router.delete('/inquiries/:id', isAdmin, async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    req.flash('success', 'Inquiry deleted!');
    res.redirect('/admin/inquiries');
  } catch (err) {
    req.flash('error', 'Error deleting inquiry');
    res.redirect('/admin/inquiries');
  }
});

module.exports = router;
