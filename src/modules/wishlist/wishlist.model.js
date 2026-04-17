const mongoose = require('mongoose')

require('../user/user.model')
require('../product/product.model')

const wishlistSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }
  },
  { timestamps: false }
)

wishlistSchema.index({ user_id: 1, product_id: 1 }, { unique: true })

module.exports = mongoose.model('Wishlist', wishlistSchema)
