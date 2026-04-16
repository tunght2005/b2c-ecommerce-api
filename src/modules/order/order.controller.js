const orderService = require('./order.service')

const orderController = {
  // 1. API Tạo đơn hàng
  createOrder: async (req, res) => {
    try {
      const user_id = req.user.id // Lấy từ token đăng nhập

      // CHỈ NHẬN address_id VÀ voucher_id (Tuyệt đối không nhận discount_price từ Frontend nữa)
      const { address_id, voucher_id } = req.body

      // Kiểm tra xem FE có gửi address_id lên không
      if (!address_id) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp address_id (địa chỉ giao hàng)'
        })
      }

      // Gọi service tạo đơn (chỉ truyền user_id, address_id, voucher_id)
      const order = await orderService.createOrder(user_id, address_id, voucher_id)

      res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công! Giỏ hàng đã được làm trống.',
        data: order
      })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  // 2. API Lấy danh sách đơn hàng của User
  getUserOrders: async (req, res) => {
    try {
      const user_id = req.user.id
      const orders = await orderService.getUserOrders(user_id)

      res.status(200).json({
        success: true,
        data: orders
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 3. API Xác nhận đơn hàng (admin)
  confirmOrder: async (req, res) => {
    try {
      const order_id = req.params.id
      const order = await orderService.confirmOrder(order_id)

      res.status(200).json({
        success: true,
        message: 'Xác nhận đơn hàng thành công',
        data: order
      })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  cancelOrder: async (req, res) => {
    try {
      const user_id = req.user.id
      const order_id = req.params.id // Lấy ID đơn hàng từ URL

      const canceledOrder = await orderService.cancelOrder(order_id, user_id)

      res.status(200).json({
        success: true,
        message: 'Đã hủy đơn hàng thành công',
        data: canceledOrder
      })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  // 5. [MỚI] API xóa đơn hàng (admin)
  deleteOrder: async (req, res) => {
    try {
      const order_id = req.params.id
      const deletedOrder = await orderService.deleteOrder(order_id)

      res.status(200).json({
        success: true,
        message: 'Xóa đơn hàng thành công',
        data: deletedOrder
      })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  // 6. [MỚI] API liệt kê tất cả đơn hàng (admin/support/shipper)
  getAllOrders: async (req, res) => {
    try {
      const { search, status, payment_status, page, limit, sortBy, sortOrder } = req.query

      const result = await orderService.listAll({
        search: search || '',
        status: status || 'all',
        payment_status: payment_status || 'all',
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc'
      })

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

module.exports = orderController
