const mongoose = require('mongoose');

const productPromotionSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  promotion_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
    required: true
  }
}, { timestamps: true });

// chống duplicate
productPromotionSchema.index(
  { product_id: 1, promotion_id: 1 },
  { unique: true }
);

module.exports = mongoose.model('ProductPromotion', productPromotionSchema);