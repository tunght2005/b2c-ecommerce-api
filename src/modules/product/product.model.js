const mongoose = require('mongoose');
require('../brand/brand.model');
require('../category/category.model');
const productSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  brand_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  description: String,
  specification: Object,
  status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);