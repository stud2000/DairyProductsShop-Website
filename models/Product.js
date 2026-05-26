const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Milk', 'Curd', 'Butter', 'Cheese', 'Ghee', 'Paneer', 'Ice Cream', 'Lassi', 'Cream', 'Other']
  },
  variants: [
    {
      quantity: { type: String, required: true }, // e.g. "500ml", "1L", "250g"
      price: { type: Number, required: true }
    }
  ],
  image: { type: String, default: 'default-product.jpg' },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  badge: { type: String, default: '' }, // e.g. "New", "Best Seller", "Organic"
  nutritionInfo: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
