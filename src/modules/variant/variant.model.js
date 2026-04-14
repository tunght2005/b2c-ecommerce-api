const mongoose = require('mongoose');

require('../product/product.model');
require('../attribute/attribute.model');

const variantSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  sku: {
    type: String,
    required: true,
    unique: true
  },

  price: Number,
  old_price: Number,
  stock: { type: Number, default: 0 },

  attributes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute'
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Variant', variantSchema);