const express = require('express');
const router = express.Router();
const cartController = require('./cart.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');

// Các route giỏ hàng hiện tại
router.get('/', authMiddleware, requireRole('customer'), cartController.getCart);
router.post('/add', authMiddleware, requireRole('customer'), cartController.addToCart);
router.delete('/remove', authMiddleware, requireRole('customer'), cartController.removeFromCart);

// [MỚI] Route cập nhật số lượng giỏ hàng (Dùng method PUT)
router.put('/update', authMiddleware, requireRole('customer'), cartController.updateQuantity);

module.exports = router;