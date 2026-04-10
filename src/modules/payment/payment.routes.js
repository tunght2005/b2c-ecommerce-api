const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const authMiddleware = require('../../middlewares/auth.middleware'); 
const requireRole = require('../../middlewares/role.middleware');
// POST: http://localhost:PORT/api/payment/create-vnpay
router.post('/create-vnpay', authMiddleware,requireRole('customer'),paymentController.createVNPAYPayment);

// GET: http://localhost:PORT/api/payment/vnpay-return
router.get('/vnpay-return', paymentController.vnpayReturn);

module.exports = router;