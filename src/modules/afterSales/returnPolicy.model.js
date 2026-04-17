const mongoose = require('mongoose')

const returnPolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    days_allowed: {
      type: Number,
      required: true,
      min: 0,
      default: 7
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

module.exports = mongoose.model('ReturnPolicy', returnPolicySchema)
