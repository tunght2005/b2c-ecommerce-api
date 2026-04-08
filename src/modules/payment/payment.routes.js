const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');

// POST: http://localhost:PORT/api/payment/create-vnpay
router.post('/create-vnpay', paymentController.createVNPAYPayment);

// GET: http://localhost:PORT/api/payment/vnpay-return
router.get('/vnpay-return', paymentController.vnpayReturn);

module.exports = router;