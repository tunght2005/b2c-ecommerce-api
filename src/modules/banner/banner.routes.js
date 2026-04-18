const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/auth.middleware')
const bannerController = require('./banner.controller')
const requireRole = require('../../middlewares/role.middleware')
const upload = require('../../middlewares/upload.middleware')

// Public routes
router.get('/', bannerController.list)
router.get('/:id', bannerController.getById)

// Admin routes
router.post('/', authMiddleware, requireRole('admin'), upload.single('image'), bannerController.create)

router.put('/:id', authMiddleware, requireRole('admin'), upload.single('image'), bannerController.update)

router.delete('/:id', authMiddleware, requireRole('admin'), bannerController.remove)

module.exports = router
