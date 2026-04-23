const mongoose = require('mongoose')

require('../user/user.model')
require('../product/product.model')

const reviewSchema = new mongoose.Schema(
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
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    admin_reply: {
      content: {
        type: String,
        trim: true
      },
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['admin', 'support']
      },
      createdAt: {
        type: Date
      },
      updatedAt: {
        type: Date
      }
    }
  },
  { timestamps: true }
)

reviewSchema.index({ user_id: 1, product_id: 1 }, { unique: true })
reviewSchema.index({ product_id: 1, createdAt: -1 })

module.exports = mongoose.model('Review', reviewSchema)
