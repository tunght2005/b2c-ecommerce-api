const mongoose = require('mongoose')

const productReturnPolicySchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    policy_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReturnPolicy',
      required: true
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

productReturnPolicySchema.index({ product_id: 1, policy_id: 1 }, { unique: true })

module.exports = mongoose.model('ProductReturnPolicy', productReturnPolicySchema)
