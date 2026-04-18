const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: null
    },
    position: {
      type: String,
      enum: ['top', 'middle', 'bottom'],
      default: 'top'
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Banner', bannerSchema, 'banners')
