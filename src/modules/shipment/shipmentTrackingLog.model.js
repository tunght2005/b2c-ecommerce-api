const mongoose = require('mongoose')

const shipmentTrackingLogSchema = new mongoose.Schema(
  {
    shipment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true
    },
    status: { type: String, required: true },
    location: { type: String, default: null },
    note: { type: String, default: null }
  },
  { timestamps: true }
)

module.exports = mongoose.model('ShipmentTrackingLog', shipmentTrackingLogSchema)
