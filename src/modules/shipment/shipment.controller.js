const shipmentService = require('./shipment.service')

const shipmentController = {
  assignShipper: async (req, res) => {
    try {
      const { order_id, delivery_staff_id, expected_delivery_at, note } = req.body
      if (!order_id || !delivery_staff_id) {
        return res.status(400).json({ success: false, message: 'order_id và delivery_staff_id là bắt buộc' })
      }

      const shipment = await shipmentService.assignShipper({
        order_id,
        delivery_staff_id,
        expected_delivery_at,
        note
      })

      res.status(201).json({ success: true, data: shipment })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  updateStatus: async (req, res) => {
    try {
      const shipment_id = req.params.id
      const { status, location, note } = req.body
      const isShipper = req.user.role === 'shipper'

      if (!status) {
        return res.status(400).json({ success: false, message: 'status là bắt buộc' })
      }

      const shipment = await shipmentService.updateShipmentStatus({
        shipment_id,
        status,
        location,
        note,
        isShipper
      })

      res.status(200).json({ success: true, data: shipment })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  getTrackingLogs: async (req, res) => {
    try {
      const shipment_id = req.params.id
      const logs = await shipmentService.getShipmentLogs(shipment_id)
      res.status(200).json({ success: true, data: logs })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  getAssignedOrders: async (req, res) => {
    try {
      const user_id = req.user.id
      const shipments = await shipmentService.getAssignedOrdersForShipper(user_id)
      res.status(200).json({ success: true, data: shipments })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  createDeliveryStaff: async (req, res) => {
    try {
      const { user_id, name, phone, email, status } = req.body
      if (!user_id || !name) {
        return res.status(400).json({ success: false, message: 'user_id và name là bắt buộc' })
      }

      const staff = await shipmentService.createDeliveryStaff({
        user_id,
        name,
        phone,
        email,
        status
      })

      res.status(201).json({ success: true, data: staff })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  listDeliveryStaff: async (req, res) => {
    try {
      const staff = await shipmentService.listDeliveryStaff()
      res.status(200).json({ success: true, data: staff })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  autoAssignShipper: async (req, res) => {
    try {
      const { order_id, expected_delivery_at, note } = req.body
      if (!order_id) {
        return res.status(400).json({ success: false, message: 'order_id là bắt buộc' })
      }

      const shipment = await shipmentService.autoAssignShipper({
        order_id,
        expected_delivery_at,
        note
      })

      res.status(201).json({ success: true, data: shipment, message: 'Tự động gán shipper thành công' })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  }
}

module.exports = shipmentController
