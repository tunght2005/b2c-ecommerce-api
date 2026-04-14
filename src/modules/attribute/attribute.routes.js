const express = require('express');
const router = express.Router();

const attributeController = require('./attribute.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');

// PUBLIC
router.get('/', attributeController.list);
router.get('/group/:groupId', attributeController.getByGroup);

// ADMIN
router.post('/', authMiddleware, requireRole('admin'), attributeController.create);
router.put('/:id', authMiddleware, requireRole('admin'), attributeController.update);
router.delete('/:id', authMiddleware, requireRole('admin'), attributeController.remove);

module.exports = router;