const express = require('express')
const router = express.Router()
const voucherController = require('./voucher.controller')
const authMiddleware = require('../../middlewares/auth.middleware')
const requireRole = require('../../middlewares/role.middleware')

// [QUAN TRỌNG] Route cho Admin tạo mã (Chính là route đang bị lỗi Cannot POST)
router.post('/create', authMiddleware, requireRole('admin'), voucherController.createVoucher)
router.get('/', authMiddleware, requireRole('admin', 'support'), voucherController.listVouchers)
router.put('/:id', authMiddleware, requireRole('admin'), voucherController.updateVoucher)
router.delete('/:id', authMiddleware, requireRole('admin'), voucherController.deleteVoucher)

// Route cho User áp dụng mã
router.post('/apply', voucherController.applyVoucher)

module.exports = router
