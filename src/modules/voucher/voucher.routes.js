const express = require('express');
const router = express.Router();
const voucherController = require('./voucher.controller');

// [QUAN TRỌNG] Route cho Admin tạo mã (Chính là route đang bị lỗi Cannot POST)
router.post('/create', voucherController.createVoucher);

// Route cho User áp dụng mã
router.post('/apply', voucherController.applyVoucher);

module.exports = router;