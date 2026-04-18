const express = require('express')
const router = express.Router()
const NotificationController = require('./notification.controller')
const authMiddleware = require('../../middlewares/auth.middleware')
const requireRole = require('../../middlewares/role.middleware')

router.use(authMiddleware)

router.post('/broadcast/customers', requireRole('admin', 'support'), NotificationController.createForCustomers)
router.post('/', NotificationController.create)
router.get('/', NotificationController.getAll)
router.patch('/read-all', NotificationController.markAllAsRead)
router.patch('/:id/read', NotificationController.markAsRead)

module.exports = router
