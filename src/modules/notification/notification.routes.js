const express = require('express')
const router = express.Router()
const NotificationController = require('./notification.controller')
const authMiddleware = require('../../middlewares/auth.middleware')

router.use(authMiddleware)

router.get('/', NotificationController.getAll)
router.patch('/read-all', NotificationController.markAllAsRead)
router.patch('/:id/read', NotificationController.markAsRead)

module.exports = router
