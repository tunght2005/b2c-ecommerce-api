const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  url: { type: String, required: true },
  is_primary: { type: Boolean, default: false },
  sort_order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ProductImage', productImageSchema);