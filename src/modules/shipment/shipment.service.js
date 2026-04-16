const Shipment = require('./shipment.model')
const ShipmentTrackingLog = require('./shipmentTrackingLog.model')
const DeliveryStaff = require('./deliveryStaff.model')
const Order = require('../order/order.model')
const { User } = require('../auth/auth.model')

const validStatuses = ['pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled']

// Định nghĩa state transitions được phép
const allowedTransitions = {
  assigned: ['in_transit', 'cancelled', 'failed'],
  in_transit: ['delivered', 'failed'],
  delivered: [],
  failed: ['in_transit'],
  cancelled: []
}

const shipmentService = {
  listAllShipments: async ({ status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    const filter = {}

    if (status && status !== 'all') {
      filter.status = status
    }

    const normalizedLimit = Math.max(1, Math.min(parseInt(limit) || 10, 100))
    const normalizedPage = Math.max(1, parseInt(page) || 1)
    const totalItems = await Shipment.countDocuments(filter)
    const totalPages = Math.max(1, Math.ceil(totalItems / normalizedLimit))
    const safePage = Math.min(normalizedPage, totalPages)

    const validSortFields = ['createdAt', 'updatedAt', 'status', 'assigned_at', 'expected_delivery_at', 'delivered_at']
    const normalizedSortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const normalizedSortOrder = sortOrder === 'asc' ? 1 : -1

    const shipments = await Shipment.find(filter)
      .populate({
        path: 'order_id',
        model: 'Order',
        populate: [
          {
            path: 'user_id',
            model: 'User',
            select: 'username email phone role'
          },
          {
            path: 'items.variant_id',
            model: 'Variant',
            select: 'sku'
          },
          {
            path: 'voucher_id',
            select: 'code discount_type discount_value'
          }
        ]
      })
      .populate({
        path: 'delivery_staff_id',
        model: 'DeliveryStaff',
        populate: {
          path: 'user_id',
          model: 'User',
          select: 'username email phone role'
        }
      })
      .sort({ [normalizedSortField]: normalizedSortOrder })
      .skip((safePage - 1) * normalizedLimit)
      .limit(normalizedLimit)

    const allShipments = await Shipment.find(filter)
    const totalShipments = allShipments.length
    const pendingShipments = allShipments.filter((item) => item.status === 'pending').length
    const assignedShipments = allShipments.filter((item) => item.status === 'assigned').length
    const inTransitShipments = allShipments.filter((item) => item.status === 'in_transit').length
    const deliveredShipments = allShipments.filter((item) => item.status === 'delivered').length

    return {
      shipments: shipments.map((shipment) => shipment.toObject()),
      pagination: {
        page: safePage,
        limit: normalizedLimit,
        totalItems,
        totalPages
      },
      summary: {
        totalShipments,
        pendingShipments,
        assignedShipments,
        inTransitShipments,
        deliveredShipments
      }
    }
  },

  assignShipper: async ({ order_id, delivery_staff_id, expected_delivery_at, note }) => {
    const order = await Order.findById(order_id)
    if (!order) {
      throw new Error('Order không tồn tại')
    }

    if (order.status === 'cancelled') {
      throw new Error('Không thể giao đơn hàng đã bị hủy')
    }

    const staff = await DeliveryStaff.findById(delivery_staff_id)
    if (!staff || staff.status !== 'active') {
      throw new Error('Shipper không hợp lệ hoặc chưa hoạt động')
    }

    const existingShipment = await Shipment.findOne({ order_id })
    if (existingShipment) {
      throw new Error('Đơn hàng này đã có shipment, vui lòng dùng API cập nhật trạng thái')
    }

    const shipment = new Shipment({
      order_id,
      delivery_staff_id,
      status: 'assigned',
      assigned_at: new Date(),
      expected_delivery_at,
      notes: note || null
    })

    await shipment.save()

    await ShipmentTrackingLog.create({
      shipment_id: shipment._id,
      status: 'assigned',
      location: null,
      note: note || 'Shipper được phân công cho đơn hàng'
    })

    await Order.findByIdAndUpdate(order_id, { status: 'shipping' })

    return shipment
  },

  updateShipmentStatus: async ({ shipment_id, status, location, note, isShipper = false }) => {
    if (!validStatuses.includes(status)) {
      throw new Error(`Trạng thái không hợp lệ. Các giá trị hợp lệ: ${validStatuses.join(', ')}`)
    }

    const shipment = await Shipment.findById(shipment_id)
    if (!shipment) {
      throw new Error('Shipment không tồn tại')
    }

    // Kiểm tra state transition có hợp lệ không
    const currentStatus = shipment.status
    if (!allowedTransitions[currentStatus]?.includes(status)) {
      throw new Error(
        `Không thể đổi từ trạng thái '${currentStatus}' sang '${status}'. ` +
          `Các trạng thái được phép: ${allowedTransitions[currentStatus]?.join(', ') || 'không có'}`
      )
    }

    // Nếu là shipper, chỉ cho phép cập nhật location + status của delivery
    if (isShipper && !['in_transit', 'delivered', 'failed'].includes(status)) {
      throw new Error('Shipper chỉ được cập nhật trạng thái: in_transit, delivered, failed')
    }

    shipment.status = status
    let trackingLocation = location || null

    if (status === 'delivered') {
      shipment.delivered_at = new Date()

      const order = await Order.findById(shipment.order_id)
      if (order && order.address_id) {
        shipment.delivery_address_id = order.address_id
        if (!trackingLocation) {
          trackingLocation = order.address_id.toString()
        }
      }
    }

    await shipment.save()

    await ShipmentTrackingLog.create({
      shipment_id,
      status,
      location: trackingLocation,
      note: note || null
    })

    const orderStatusMap = {
      assigned: 'shipping',
      in_transit: 'shipping',
      delivered: 'completed',
      failed: 'cancelled',
      cancelled: 'cancelled'
    }

    const nextOrderStatus = orderStatusMap[status] || shipment.status
    await Order.findByIdAndUpdate(shipment.order_id, { status: nextOrderStatus })

    return shipment
  },

  getShipmentLogs: async (shipment_id) => {
    const shipment = await Shipment.findById(shipment_id)
    if (!shipment) {
      throw new Error('Shipment không tồn tại')
    }
    return await ShipmentTrackingLog.find({ shipment_id }).sort({ createdAt: 1 })
  },

  getAssignedOrdersForShipper: async (user_id) => {
    const staff = await DeliveryStaff.findOne({ user_id, status: 'active' })
    if (!staff) {
      return []
    }
    return await Shipment.find({ delivery_staff_id: staff._id })
      .populate({
        path: 'order_id',
        model: 'Order',
        populate: [
          {
            path: 'user_id',
            model: 'User',
            select: 'username email phone role'
          },
          {
            path: 'items.variant_id',
            model: 'Variant',
            select: 'sku'
          },
          {
            path: 'voucher_id',
            select: 'code discount_type discount_value'
          }
        ]
      })
      .populate({
        path: 'delivery_staff_id',
        model: 'DeliveryStaff',
        populate: {
          path: 'user_id',
          model: 'User',
          select: 'username email phone role'
        }
      })
  },

  createDeliveryStaff: async ({ user_id, name, phone, email, status = 'active' }) => {
    const user = await User.findById(user_id)
    if (!user) {
      throw new Error('User không tồn tại')
    }

    if (user.role !== 'shipper') {
      throw new Error(`User phải có role 'shipper', hiện tại là '${user.role}'`)
    }

    const existing = await DeliveryStaff.findOne({ user_id })
    if (existing) {
      throw new Error('Delivery staff đã tồn tại với user này')
    }

    return await DeliveryStaff.create({ user_id, name, phone, email, status })
  },

  listDeliveryStaff: async () => {
    return await DeliveryStaff.find()
      .populate({
        path: 'user_id',
        model: 'User',
        select: 'username email phone role'
      })
      .sort({ createdAt: -1 })
  },

  autoAssignShipper: async ({ order_id, expected_delivery_at, note }) => {
    const order = await Order.findById(order_id)
    if (!order) {
      throw new Error('Order không tồn tại')
    }

    if (order.status !== 'confirmed') {
      throw new Error('Đơn hàng phải có trạng thái "confirmed" để gán shipper')
    }

    const existingShipment = await Shipment.findOne({ order_id })
    if (existingShipment) {
      throw new Error('Đơn hàng này đã có shipment')
    }

    // Tìm shipper có ít việc nhất (ít shipment chưa hoàn thành)
    const shippers = await DeliveryStaff.find({ status: 'active' })
    if (shippers.length === 0) {
      throw new Error('Không có shipper sẵn sàng')
    }

    // Đếm số shipment chưa xong cho mỗi shipper
    const shipperWorkload = await Promise.all(
      shippers.map(async (shipper) => {
        const activeShipments = await Shipment.countDocuments({
          delivery_staff_id: shipper._id,
          status: { $in: ['assigned', 'in_transit'] }
        })
        return { shipper, activeShipments }
      })
    )

    // Chọn shipper có workload thấp nhất
    const selected = shipperWorkload.reduce((prev, curr) => (curr.activeShipments < prev.activeShipments ? curr : prev))

    const delivery_staff_id = selected.shipper._id

    const shipment = new Shipment({
      order_id,
      delivery_staff_id,
      status: 'assigned',
      assigned_at: new Date(),
      expected_delivery_at,
      notes: note || null
    })

    await shipment.save()

    await ShipmentTrackingLog.create({
      shipment_id: shipment._id,
      status: 'assigned',
      location: null,
      note: note || `Tự động gán cho shipper: ${selected.shipper.name}`
    })

    await Order.findByIdAndUpdate(order_id, { status: 'shipping' })

    return shipment
  }
}

module.exports = shipmentService
