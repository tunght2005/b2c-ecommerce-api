const express = require('express')
const router = express.Router()
const orderController = require('./order.controller')
// Đổi đường dẫn middleware cho khớp với project của bạn (nếu cần)
const authMiddleware = require('../../middlewares/auth.middleware')
const requireRole = require('../../middlewares/role.middleware')
// API Tạo đơn hàng mới (FE gọi khi khách bấm Thanh toán)
router.post('/create', authMiddleware, requireRole('customer'), orderController.createOrder)

// API Lấy lịch sử đơn hàng (FE gọi khi khách vào trang Quản lý đơn hàng)
router.get('/', authMiddleware, requireRole('customer'), orderController.getUserOrders)

// API Xác nhận đơn hàng (Admin)
router.patch('/:id/confirm', authMiddleware, requireRole('admin', 'support'), orderController.confirmOrder)

// Route cho User tự hủy đơn hàng
router.put('/cancel/:id', authMiddleware, requireRole('customer'), orderController.cancelOrder)

// API xóa đơn hàng (Admin)
router.delete('/:id', authMiddleware, requireRole('admin'), orderController.deleteOrder)

// API liệt kê tất cả đơn hàng (Admin/Support/Shipper)
router.get('/admin/list', authMiddleware, requireRole('admin', 'support', 'shipper'), orderController.getAllOrders)

module.exports = router
