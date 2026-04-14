const express = require('express');
const router = express.Router();

const controller = require('./attributeGroup.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');

// PUBLIC
router.get('/', controller.list);

// ADMIN
router.post('/', authMiddleware, requireRole('admin'), controller.create);

router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  controller.update
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  controller.remove
);

module.exports = router;