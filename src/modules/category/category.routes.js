const express = require('express');
const router = express.Router();

const categoryController = require('./category.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');

router.get('/', categoryController.list);

router.post('/', authMiddleware, requireRole('admin'), categoryController.create);

router.put('/:id', authMiddleware, requireRole('admin'), categoryController.update);

router.delete('/:id', authMiddleware, requireRole('admin'), categoryController.remove);

module.exports = router;