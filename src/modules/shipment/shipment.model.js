const mongoose = require('mongoose')

const shipmentSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    delivery_address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      default: null
    },
    delivery_staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryStaff'
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled'],
      default: 'pending'
    },
    expected_delivery_at: { type: Date, default: null },
    assigned_at: { type: Date, default: null },
    delivered_at: { type: Date, default: null },
    notes: { type: String, default: null }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Shipment', shipmentSchema)
