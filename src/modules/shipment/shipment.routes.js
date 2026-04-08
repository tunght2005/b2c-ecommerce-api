const express = require('express')
const router = express.Router()
const shipmentController = require('./shipment.controller')
const authMiddleware = require('../../middlewares/auth.middleware')
const requireRole = require('../../middlewares/role.middleware')

router.post('/assign', authMiddleware, requireRole('admin'), shipmentController.assignShipper)
router.post('/auto-assign', authMiddleware, requireRole('admin'), shipmentController.autoAssignShipper)
router.patch('/:id/status', authMiddleware, requireRole('admin', 'shipper'), shipmentController.updateStatus)
router.get('/:id/logs', authMiddleware, requireRole('admin', 'shipper'), shipmentController.getTrackingLogs)
router.get('/assigned-orders', authMiddleware, requireRole('shipper'), shipmentController.getAssignedOrders)

router.post('/delivery-staff', authMiddleware, requireRole('admin'), shipmentController.createDeliveryStaff)
router.get('/delivery-staff', authMiddleware, requireRole('admin'), shipmentController.listDeliveryStaff)

module.exports = router
