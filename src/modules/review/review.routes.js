const express = require('express')
const router = express.Router()

const reviewController = require('./review.controller')
const authMiddleware = require('../../middlewares/auth.middleware')
const requireRole = require('../../middlewares/role.middleware')

router.get('/product/:productId', reviewController.getReviewsByProduct)
router.get('/my', authMiddleware, requireRole('customer'), reviewController.getMyReviews)
router.post('/', authMiddleware, requireRole('customer'), reviewController.createReview)
router.put('/:id', authMiddleware, requireRole('customer'), reviewController.updateReview)
router.delete('/:id', authMiddleware, requireRole('customer'), reviewController.deleteReview)

module.exports = router
