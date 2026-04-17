const mongoose = require('mongoose')

const WARRANTY_STATUS = ['ACTIVE', 'EXPIRED', 'CLAIMED']

const warrantySchema = new mongoose.Schema(
  {
    order_item_id: {
      type: String,
      required: true,
      trim: true
    },
    warranty_period: {
      type: Number,
      required: true,
      min: 1,
      default: 12
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: WARRANTY_STATUS,
      default: 'ACTIVE'
    },
    claim_count: {
      type: Number,
      min: 0,
      default: 0
    },
    description_issue: {
      type: String,
      default: ''
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

module.exports = {
  Warranty: mongoose.model('Warranty', warrantySchema),
  WARRANTY_STATUS
}
