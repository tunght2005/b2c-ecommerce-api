const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Support staff
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Feedback', feedbackSchema)
