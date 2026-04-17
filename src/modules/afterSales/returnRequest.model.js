const mongoose = require('mongoose')

const RETURN_STATUS = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']

const returnRequestSchema = new mongoose.Schema(
  {
    order_item_id: {
      type: String,
      required: true,
      trim: true
    },
    policy_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReturnPolicy',
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: RETURN_STATUS,
      default: 'PENDING'
    },
    refund_amount: {
      type: Number,
      min: 0,
      default: 0
    },
    evidence_image: {
      type: String,
      default: ''
    },
    approved_at: {
      type: Date,
      default: null
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

module.exports = {
  ReturnRequest: mongoose.model('ReturnRequest', returnRequestSchema),
  RETURN_STATUS
}
