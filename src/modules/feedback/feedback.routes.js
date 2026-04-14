const express = require('express')
const router = express.Router()
const feedbackController = require('./feedback.controller')
const authMiddleware = require('../../middlewares/auth.middleware')
const roleMiddleware = require('../../middlewares/role.middleware')

// User routes
router.post('/', authMiddleware, feedbackController.createFeedback)
router.get('/my', authMiddleware, feedbackController.getUserFeedbacks)
router.get('/:id', authMiddleware, feedbackController.getFeedbackDetail)
router.post('/:id/reply', authMiddleware, feedbackController.replyToFeedback)
router.get('/:id/replies', authMiddleware, feedbackController.getFeedbackReplies)
router.post('/:id/rate', authMiddleware, feedbackController.rateFeedback)
router.put('/rating/:ratingId', authMiddleware, feedbackController.updateRating)
router.delete('/rating/:ratingId', authMiddleware, feedbackController.deleteRating)

// Admin/Support routes
router.get('/',
  authMiddleware,
  roleMiddleware(['admin', 'support']),
  feedbackController.getAllFeedbacks
)

router.put('/:id',
  authMiddleware,
  roleMiddleware(['admin', 'support']),
  feedbackController.updateFeedback
)

module.exports = router
