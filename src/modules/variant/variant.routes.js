const express = require('express');
const router = express.Router();

const variantController = require('./variant.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');


// ================= PUBLIC =================

// Lấy variant theo product
router.get('/product/:productId', variantController.getByProduct);

// Filter theo attribute
router.get('/filter', variantController.filter);


// ================= ADMIN =================

// Tạo variant
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  variantController.create
);

// Update variant
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  variantController.update
);

// Xoá variant
router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  variantController.remove
);

module.exports = router;