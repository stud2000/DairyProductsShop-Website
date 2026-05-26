# 🐄 Shree Dairy Farm – Full Stack Website

A complete dairy products shop website with public frontend + admin panel.

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Templating:** EJS
- **File Uploads:** Multer
- **Auth:** bcryptjs + express-session
- **CSS:** Custom (no frameworks)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v16+
- MongoDB running locally on port 27017

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Edit `.env` file (already set with defaults):
```
MONGODB_URI=mongodb://localhost:27017/dairyshop
SESSION_SECRET=dairy_shop_secret_key_2024
PORT=3000
ADMIN_EMAIL=admin@dairyshop.com
ADMIN_PASSWORD=Admin@123
```

### 4. Start the Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 5. Open in Browser
- 🌐 Website: http://localhost:3000
- 🔐 Admin Panel: http://localhost:3000/admin/login

---

## 🔐 Admin Login
| Field    | Value                  |
|----------|------------------------|
| Email    | admin@dairyshop.com    |
| Password | Admin@123              |

---

## 📦 Features

### Public Website
- ✅ Beautiful homepage with hero, stats, features
- ✅ Products listing with search, filter by category, sort
- ✅ Product detail page with variant selector
- ✅ About Us page with team section
- ✅ Contact page with inquiry form
- ✅ WhatsApp & call integration
- ✅ Floating call button
- ✅ Shop hours, location, map placeholder
- ✅ Testimonials section
- ✅ Responsive mobile design

### Admin Panel
- ✅ Secure login with session auth
- ✅ Dashboard with stats & charts
- ✅ Add / Edit / Delete products
- ✅ Product image upload (drag & drop)
- ✅ Multiple price variants per product (500ml/1L etc.)
- ✅ Toggle product availability (live toggle)
- ✅ Feature products on homepage
- ✅ View & manage all customer inquiries
- ✅ Update inquiry status (New / In Progress / Resolved)
- ✅ Add admin notes to inquiries

### Auto-Seeded Data
On first run, the app automatically creates:
- Admin account
- 10 sample products across all categories

---

## 📁 Project Structure
```
dairy-shop/
├── server.js           # Main app entry
├── config/db.js        # MongoDB connection
├── models/             # Mongoose models
│   ├── Product.js
│   ├── Inquiry.js
│   └── Admin.js
├── routes/
│   ├── public.js       # Public website routes
│   └── admin.js        # Admin panel routes
├── middleware/
│   ├── auth.js         # Admin auth middleware
│   └── upload.js       # Multer file upload
├── views/              # EJS templates
│   ├── index.ejs
│   ├── products.ejs
│   ├── product-detail.ejs
│   ├── contact.ejs
│   ├── about.ejs
│   ├── 404.ejs
│   ├── partials/
│   └── admin/
├── public/
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript
│   └── uploads/        # Product images
└── .env
```

---

## 📞 Shop Contact (Update in views/partials/footer.ejs & navbar.ejs)
- Phone: +91 98765 43210
- Address: 123, Dairy Lane, Near Bus Stand, Solapur, Maharashtra

---

## 🔧 Customization
1. Update shop name/contact in `views/partials/navbar.ejs` and `footer.ejs`
2. Change admin credentials in `.env`
3. Replace Google Maps URL in `views/index.ejs` and `contact.ejs`
4. Update WhatsApp number (replace 919876543210 with your number)
