const mongoose = require('mongoose')

const deliveryStaffSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: { type: String, required: true },
    phone: { type: String, default: null },
    email: { type: String, default: null },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('DeliveryStaff', deliveryStaffSchema)
