const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware')
const brandController = require('./brand.controller')
const requireRole = require('../../middlewares/role.middleware')
const upload = require('../../middlewares/upload.middleware');

router.get('/', brandController.list);
router.post('/', authMiddleware, requireRole('admin'), upload.single('logo'), brandController.create);
router.put(
    '/:id',
    authMiddleware,
    requireRole('admin'),
    upload.single('logo'),
    brandController.update
  );
router.delete(
    '/:id',
    authMiddleware,
    requireRole('admin'),
    brandController.remove
  );
module.exports = router;