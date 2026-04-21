const Order = require('./order.model')
const Cart = require('../cart/cart.model')
const Voucher = require('../voucher/voucher.model')
const Shipment = require('../shipment/shipment.model')
const DeliveryStaff = require('../shipment/deliveryStaff.model')
const Variant = require('../variant/variant.model')
const voucherService = require('../voucher/voucher.service') // NHÚNG THÊM ĐỂ TÍNH TIỀN

const orderService = {
  // 1. Tạo đơn hàng mới từ Giỏ hàng (Đã bỏ tham số discount_price)
  createOrder: async (user_id, address_id, voucher_id = null) => {
    // Lấy giỏ hàng và ÉP Mongoose lấy thông tin Variant
    const cart = await Cart.findOne({ user_id }).populate({
      path: 'items.variant_id',
      model: 'Variant'
    })

    if (!cart || cart.items.length === 0) {
      throw new Error('Giỏ hàng đang trống, không thể đặt hàng')
    }

    // Tính tổng tiền và chuẩn bị mảng items cho đơn hàng
    let total_price = 0
    const orderItems = cart.items.map((item) => {
      if (!item.variant_id) {
        throw new Error('Sản phẩm trong giỏ hàng không hợp lệ')
      }

      if (Number(item.quantity) <= 0) {
        throw new Error('Số lượng sản phẩm trong giỏ hàng không hợp lệ')
      }

      const variantPrice = item.variant_id.price || 0
      total_price += variantPrice * item.quantity

      return {
        variant_id: item.variant_id._id,
        price: variantPrice, // Chốt giá ngay tại thời điểm mua
        quantity: item.quantity
      }
    })

    // BẮT ĐẦU TÍNH TOÁN TIỀN GIẢM GIÁ TẠI BACKEND
    let discount_price = 0
    if (voucher_id) {
      const voucher = await Voucher.findById(voucher_id)
      if (!voucher) {
        throw new Error('Mã giảm giá không tồn tại hoặc không hợp lệ.')
      }

      // Tận dụng lại hàm calculateDiscount để check hạn sử dụng, lượt dùng, đơn tối thiểu...
      const discountResult = await voucherService.calculateDiscount(voucher.code, total_price)
      discount_price = discountResult.discount_amount
    }

    const final_price = total_price - discount_price

    const deductedItems = []
    let orderCreated = false

    try {
      // Trừ kho ngay khi tạo đơn, kèm điều kiện để không thể âm kho.
      for (const item of orderItems) {
        const updatedVariant = await Variant.findOneAndUpdate(
          {
            _id: item.variant_id,
            stock: { $gte: item.quantity }
          },
          {
            $inc: { stock: -item.quantity }
          },
          { new: true }
        )

        if (!updatedVariant) {
          const currentVariant = await Variant.findById(item.variant_id).select('sku stock')
          const availableStock = Number(currentVariant?.stock) || 0
          const sku = currentVariant?.sku || item.variant_id
          throw new Error(`Số lượng đặt vượt quá kho. SKU ${sku} chỉ còn ${availableStock}`)
        }

        deductedItems.push({ variant_id: item.variant_id, quantity: item.quantity })
      }

      // Tạo Document Order mới
      const newOrder = new Order({
        user_id,
        address_id,
        items: orderItems,
        total_price,
        discount_price,
        voucher_id,
        final_price
      })

      // Lưu đơn hàng vào database
      await newOrder.save()
      orderCreated = true

      // Tăng số lượt sử dụng voucher lên 1
      if (voucher_id) {
        await Voucher.findByIdAndUpdate(voucher_id, {
          $inc: { used_count: 1 }
        })
      }

      // Đặt hàng thành công thì dọn sạch giỏ hàng
      cart.items = []
      await cart.save()

      return newOrder
    } catch (error) {
      if (!orderCreated && deductedItems.length > 0) {
        await Promise.all(
          deductedItems.map((item) =>
            Variant.findByIdAndUpdate(item.variant_id, {
              $inc: { stock: item.quantity }
            })
          )
        )
      }

      throw error
    }
  },

  // 2. Lấy danh sách lịch sử đơn hàng của 1 user
  getUserOrders: async (user_id) => {
    return await Order.find({ user_id })
      .sort({ createdAt: -1 }) // Sắp xếp đơn mới nhất lên đầu
      .populate({
        path: 'address_id',
        model: 'Address',
        select: 'receiver_name phone province district ward detail latitude longitude is_default'
      })
      .populate({
        path: 'items.variant_id',
        model: 'Variant',
        select: 'sku' // Chỉ lấy mã SKU cho nhẹ
      })
      .populate({
        path: 'voucher_id',
        select: 'code discount_type discount_value'
      })
  },

  // 3. Xác nhận đơn hàng (admin xác nhận trước khi gán shipper)
  confirmOrder: async (order_id) => {
    const order = await Order.findById(order_id)
    if (!order) {
      throw new Error('Order không tồn tại')
    }

    if (order.status !== 'pending') {
      throw new Error(`Order đang ở trạng thái '${order.status}', không thể xác nhận`)
    }

    order.status = 'confirmed'
    await order.save()

    return order
  },

  // 4. [MỚI] Hủy đơn hàng
  cancelOrder: async (order_id, user_id = null) => {
    const order = await Order.findById(order_id)

    if (!order) {
      throw new Error('Đơn hàng không tồn tại')
    }

    // Bổ sung bảo mật: Nếu user_id được truyền vào (tức là user tự hủy),
    // phải kiểm tra xem đơn hàng này có đúng là của user đó không.
    if (user_id && order.user_id.toString() !== user_id.toString()) {
      throw new Error('Bạn không có quyền hủy đơn hàng này')
    }

    // Chỉ cho phép hủy nếu đơn hàng đang ở trạng thái chờ xử lý hoặc đã xác nhận
    // (Không thể hủy khi đang giao 'shipping' hoặc đã giao 'delivered')
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      throw new Error(`Đơn hàng đang ở trạng thái '${order.status}', không thể hủy`)
    }

    // Hoàn kho cho tất cả sản phẩm trong đơn trước khi hủy đơn.
    await Promise.all(
      order.items.map((item) =>
        Variant.findByIdAndUpdate(item.variant_id, {
          $inc: { stock: Number(item.quantity) || 0 }
        })
      )
    )

    // Cập nhật trạng thái thành 'cancelled'
    order.status = 'cancelled'
    await order.save()

    //  LOGIC E-COMMERCE: Hoàn lại lượt sử dụng Voucher cho hệ thống
    if (order.voucher_id) {
      await Voucher.findByIdAndUpdate(order.voucher_id, {
        $inc: { used_count: -1 } // Giảm số lượt đã dùng đi 1
      })
    }

    return order
  },

  // 5. [MỚI] Xóa đơn hàng (admin)
  deleteOrder: async (order_id) => {
    const order = await Order.findById(order_id)

    if (!order) {
      throw new Error('Đơn hàng không tồn tại')
    }

    await Order.findByIdAndDelete(order_id)
    return order
  },

  // 6. [MỚI] Liệt kê tất cả đơn hàng cho admin/support/shipper (với filter, pagination, sort)
  listAll: async ({
    search,
    status,
    payment_status,
    requesterRole,
    requesterUserId,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }) => {
    // Xây dựng filter
    const filter = {}

    if (search && search.trim()) {
      filter._id = { $regex: search.trim(), $options: 'i' }
    }

    if (status && status !== 'all') {
      filter.status = status
    }

    if (payment_status && payment_status !== 'all') {
      filter.payment_status = payment_status
    }

    if (requesterRole === 'shipper') {
      const staff = await DeliveryStaff.findOne({ user_id: requesterUserId, status: 'active' }).select('_id')

      if (!staff) {
        return {
          orders: [],
          pagination: {
            page: 1,
            limit: Math.max(1, Math.min(parseInt(limit) || 10, 100)),
            totalItems: 0,
            totalPages: 1
          },
          summary: {
            totalOrders: 0,
            pendingOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            totalRevenue: 0
          }
        }
      }

      const assignedShipments = await Shipment.find({ delivery_staff_id: staff._id }).select('order_id')
      const assignedOrderIds = assignedShipments.map((shipment) => shipment.order_id).filter(Boolean)
      filter._id = { $in: assignedOrderIds }
    }

    // Normalize pagination
    const normalizedLimit = Math.max(1, Math.min(parseInt(limit) || 10, 100))
    const normalizedPage = Math.max(1, parseInt(page) || 1)
    const totalItems = await Order.countDocuments(filter)
    const totalPages = Math.max(1, Math.ceil(totalItems / normalizedLimit))
    const safePage = Math.min(normalizedPage, totalPages)

    // Normalize sort
    const validSortFields = ['createdAt', 'updatedAt', 'status', 'payment_status', 'total_price', 'final_price']
    const normalizedSortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const normalizedSortOrder = sortOrder === 'asc' ? 1 : -1

    // Fetch orders
    const orders = await Order.find(filter)
      .populate({
        path: 'user_id',
        model: 'User',
        select: 'username email phone role'
      })
      .populate({
        path: 'address_id',
        model: 'Address',
        select: 'receiver_name phone province district ward detail latitude longitude is_default'
      })
      .populate({
        path: 'items.variant_id',
        model: 'Variant',
        select: 'sku'
      })
      .populate({
        path: 'voucher_id',
        select: 'code discount_type discount_value'
      })
      .sort({ [normalizedSortField]: normalizedSortOrder })
      .skip((safePage - 1) * normalizedLimit)
      .limit(normalizedLimit)

    const orderIds = orders.map((order) => order._id)
    const shipments = await Shipment.find({ order_id: { $in: orderIds } })
      .populate({
        path: 'delivery_staff_id',
        model: 'DeliveryStaff',
        select: 'name phone email user_id',
        populate: {
          path: 'user_id',
          model: 'User',
          select: 'username email phone role'
        }
      })
      .select('order_id status delivery_staff_id')

    const shipmentByOrderId = new Map(shipments.map((shipment) => [shipment.order_id.toString(), shipment.toObject()]))

    const ordersWithShipment = orders.map((order) => {
      const orderObject = order.toObject()
      return {
        ...orderObject,
        shipment: shipmentByOrderId.get(order._id.toString()) || null
      }
    })

    // Tính thống kê
    const summaryFilter = { ...filter }
    if (search && search.trim()) {
      delete summaryFilter._id
    }

    const allOrders = await Order.find(summaryFilter)
    const totalOrders = allOrders.length
    const pendingOrders = allOrders.filter((o) => o.status === 'pending').length
    const completedOrders = allOrders.filter((o) => o.status === 'completed').length
    const cancelledOrders = allOrders.filter((o) => o.status === 'cancelled').length
    const totalRevenue = allOrders.reduce((acc, o) => acc + o.final_price, 0)

    return {
      orders: ordersWithShipment,
      pagination: {
        page: safePage,
        limit: normalizedLimit,
        totalItems,
        totalPages
      },
      summary: {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue
      }
    }
  }
}

module.exports = orderService
