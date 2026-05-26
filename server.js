require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'dairy_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Flash messages
app.use(flash());

// Global vars
app.use((req, res, next) => {
  res.locals.adminName = req.session.adminName || null;
  next();
});

// Routes
app.use('/', require('./routes/public'));
app.use('/admin', require('./routes/admin'));

// 404
app.use((req, res) => {
  res.status(404).render('404', {});
});

// Seed admin & sample data on first run
const seedData = async () => {
  const Admin = require('./models/Admin');
  const Product = require('./models/Product');

  const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL || 'admin@dairyshop.com' });
  if (!adminExists) {
    await Admin.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@dairyshop.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123'
    });
    console.log('✅ Admin account created: admin@dairyshop.com / Admin@123');
  }

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    const sampleProducts = [
      { name: 'Fresh Full Cream Milk', description: 'Pure and fresh full cream milk sourced from healthy cows. Rich in calcium and protein, perfect for your daily needs.', category: 'Milk', variants: [{ quantity: '500ml', price: 30 }, { quantity: '1L', price: 58 }, { quantity: '2L', price: 110 }], isFeatured: true, badge: 'Best Seller', nutritionInfo: 'Fat: 3.5%, Protein: 3.2%, Calcium: 120mg per 100ml' },
      { name: 'Toned Milk', description: 'Low-fat toned milk, great for health-conscious individuals. Same taste, fewer calories.', category: 'Milk', variants: [{ quantity: '500ml', price: 25 }, { quantity: '1L', price: 48 }], isFeatured: true, badge: 'Healthy', nutritionInfo: 'Fat: 1.5%, Protein: 3%, Calcium: 110mg per 100ml' },
      { name: 'Fresh Curd', description: 'Thick and creamy homemade-style curd made from pure milk. Perfect for raita, lassi, and daily use.', category: 'Curd', variants: [{ quantity: '200g', price: 20 }, { quantity: '400g', price: 38 }, { quantity: '1kg', price: 90 }], isFeatured: true, badge: 'Fresh Daily', nutritionInfo: 'Probiotic-rich, good for digestion' },
      { name: 'Pure Desi Ghee', description: 'Traditionally churned pure desi ghee from cow milk. Aromatic, golden and full of goodness.', category: 'Ghee', variants: [{ quantity: '250ml', price: 180 }, { quantity: '500ml', price: 350 }, { quantity: '1L', price: 680 }], isFeatured: true, badge: 'Premium', nutritionInfo: 'Rich in fat-soluble vitamins A, D, E, K' },
      { name: 'White Butter', description: 'Freshly churned white butter made from pure cream. Soft, spreadable and absolutely delicious.', category: 'Butter', variants: [{ quantity: '100g', price: 55 }, { quantity: '200g', price: 105 }, { quantity: '500g', price: 250 }], isFeatured: false, badge: 'Fresh', nutritionInfo: 'Unsalted, natural cream butter' },
      { name: 'Fresh Paneer', description: 'Soft and fresh cottage cheese made from whole milk. Perfect for curries, tikka, and snacks.', category: 'Paneer', variants: [{ quantity: '200g', price: 80 }, { quantity: '500g', price: 190 }, { quantity: '1kg', price: 370 }], isFeatured: true, badge: 'Fresh Daily', nutritionInfo: 'High protein, good calcium source' },
      { name: 'Sweet Lassi', description: 'Refreshing sweet lassi made from thick curd. Chilled, delicious and perfect for summers.', category: 'Lassi', variants: [{ quantity: '200ml', price: 25 }, { quantity: '500ml', price: 55 }], isFeatured: true, badge: 'Summer Special', nutritionInfo: 'Probiotic drink, cooling properties' },
      { name: 'Mozzarella Cheese', description: 'Fresh mozzarella cheese for pizzas, salads and Italian dishes. Creamy, stretchy and delicious.', category: 'Cheese', variants: [{ quantity: '200g', price: 120 }, { quantity: '400g', price: 230 }], isFeatured: false, badge: 'New', nutritionInfo: 'Rich in calcium and protein' },
      { name: 'Vanilla Ice Cream', description: 'Creamy and rich vanilla ice cream made with real milk and natural vanilla extract.', category: 'Ice Cream', variants: [{ quantity: '100ml', price: 30 }, { quantity: '500ml', price: 130 }, { quantity: '1L', price: 250 }], isFeatured: false, badge: 'Kids Favorite', nutritionInfo: 'Made with real milk and cream' },
      { name: 'Fresh Cream', description: 'Light whipping cream for desserts, cakes and cooking. Rich, smooth and versatile.', category: 'Cream', variants: [{ quantity: '100ml', price: 40 }, { quantity: '200ml', price: 75 }], isFeatured: false, badge: 'Fresh', nutritionInfo: 'Fat: 35%, perfect for whipping' }
    ];
    await Product.insertMany(sampleProducts);
    console.log('✅ Sample products seeded!');
  }
};

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    console.log(`🐄 Dairy Shop Server running at http://localhost:${PORT}`);
    console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin/login`);

    try {
      await seedData();
    } catch (err) {
      console.error('Seed Error:', err);
    }
  });
}

module.exports = app;
