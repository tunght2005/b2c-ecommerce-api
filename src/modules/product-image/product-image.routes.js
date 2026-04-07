const express = require('express');
const router = express.Router();
const controller = require('./product-image.controller');
const upload = require('../../middlewares/upload.middleware');
const authMiddleware = require('../../middlewares/auth.middleware')
const requireRole = require('../../middlewares/role.middleware')
// upload nhiều ảnh
router.post(
  '/upload', authMiddleware, requireRole('admin'),
  upload.array('images', 10),
  controller.upload
);

// lấy theo product
router.get('/product/:product_id', controller.getByProduct);

// xoá
router.delete('/:id', authMiddleware, requireRole('admin'), controller.remove);

module.exports = router;