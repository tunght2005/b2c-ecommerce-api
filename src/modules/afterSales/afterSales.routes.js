const express = require('express')
const router = express.Router()
const afterSalesController = require('./afterSales.controller')
const authMiddleware = require('../../middlewares/auth.middleware')
const requireRole = require('../../middlewares/role.middleware')

// Return policies
router.get('/return-policies', authMiddleware, afterSalesController.listPolicies)
router.post('/return-policies', authMiddleware, requireRole('admin', 'support'), afterSalesController.createPolicy)
router.put('/return-policies/:id', authMiddleware, requireRole('admin', 'support'), afterSalesController.updatePolicy)
router.delete('/return-policies/:id', authMiddleware, requireRole('admin'), afterSalesController.deletePolicy)

router.get('/return-policies/product-links', authMiddleware, afterSalesController.listPolicyProductLinks)
router.post(
  '/return-policies/product-links',
  authMiddleware,
  requireRole('admin', 'support'),
  afterSalesController.assignPolicyToProduct
)
router.get('/return-policies/product/:productId', authMiddleware, afterSalesController.listPoliciesByProduct)

// Returns
router.get('/returns/eligible-items', authMiddleware, afterSalesController.listEligibleOrderItems)
router.get('/returns', authMiddleware, afterSalesController.listReturns)
router.post('/returns', authMiddleware, afterSalesController.createReturn)
router.get('/returns/:id', authMiddleware, afterSalesController.getReturnDetail)
router.put(
  '/returns/:id/status',
  authMiddleware,
  requireRole('admin', 'support'),
  afterSalesController.updateReturnStatus
)

// Warranty
router.get('/warranty', authMiddleware, afterSalesController.listWarranty)
router.post('/warranty', authMiddleware, afterSalesController.createWarranty)
router.put(
  '/warranty/:id/status',
  authMiddleware,
  requireRole('admin', 'support'),
  afterSalesController.updateWarrantyStatus
)
router.post('/warranty/:id/claim', authMiddleware, afterSalesController.claimWarranty)

module.exports = router
