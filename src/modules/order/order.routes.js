const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
// Đổi đường dẫn middleware cho khớp với project của bạn (nếu cần)
const authMiddleware = require('../../middlewares/auth.middleware'); 
const requireRole = require('../../middlewares/role.middleware');
// API Tạo đơn hàng mới (FE gọi khi khách bấm Thanh toán)
router.post('/create', authMiddleware,requireRole('customer'), orderController.createOrder);

// API Lấy lịch sử đơn hàng (FE gọi khi khách vào trang Quản lý đơn hàng)
router.get('/', authMiddleware,requireRole('customer'), orderController.getUserOrders);

// API Xác nhận đơn hàng (Admin)
router.patch('/:id/confirm', authMiddleware, requireRole('admin'), orderController.confirmOrder);

module.exports = router;