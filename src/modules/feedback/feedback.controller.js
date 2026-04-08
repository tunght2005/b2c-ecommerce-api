const feedbackService = require('./feedback.service')

const feedbackController = {
  // 1. Tạo feedback ticket
  createFeedback: async (req, res) => {
    try {
      const user_id = req.user.id
      const { order_id, product_id, title, content, priority } = req.body

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: 'title, content là bắt buộc'
        })
      }

      if (!order_id && !product_id) {
        return res.status(400).json({
          success: false,
          message: 'Phải cung cấp order_id hoặc product_id'
        })
      }

      const feedback = await feedbackService.createFeedback({
        user_id,
        order_id,
        product_id,
        title,
        content,
        priority
      })

      res.status(201).json({
        success: true,
        data: feedback,
        message: 'Feedback đã được tạo thành công'
      })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  // 2. Lấy danh sách feedback của user
  getUserFeedbacks: async (req, res) => {
    try {
      const user_id = req.user.id
      const feedbacks = await feedbackService.getUserFeedbacks(user_id)

      res.status(200).json({ success: true, data: feedbacks })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 3. Lấy chi tiết feedback
  getFeedbackDetail: async (req, res) => {
    try {
      const feedback_id = req.params.id
      const user_id = req.user.id

      const feedback = await feedbackService.getFeedbackDetail(feedback_id, user_id)

      res.status(200).json({ success: true, data: feedback })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  // 4. Reply to feedback
  replyToFeedback: async (req, res) => {
    try {
      const feedback_id = req.params.id
      const user_id = req.user.id
      const { content, is_internal } = req.body

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'content là bắt buộc'
        })
      }

      const reply = await feedbackService.replyToFeedback({
        feedback_id,
        user_id,
        content,
        is_internal
      })

      res.status(201).json({
        success: true,
        data: reply,
        message: 'Reply đã được gửi'
      })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  // 5. Lấy replies của feedback
  getFeedbackReplies: async (req, res) => {
    try {
      const feedback_id = req.params.id
      const user_id = req.user.id

      const replies = await feedbackService.getFeedbackReplies(feedback_id, user_id)

      res.status(200).json({ success: true, data: replies })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  // 6. Đánh giá feedback
  rateFeedback: async (req, res) => {
    try {
      const feedback_id = req.params.id
      const user_id = req.user.id
      const { rating, comment } = req.body

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'rating phải từ 1-5'
        })
      }

      const ratingDoc = await feedbackService.rateFeedback({
        feedback_id,
        user_id,
        rating,
        comment
      })

      res.status(201).json({
        success: true,
        data: ratingDoc,
        message: 'Cảm ơn bạn đã đánh giá!'
      })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  // 6.1. Sửa đánh giá
  updateRating: async (req, res) => {
    try {
      const rating_id = req.params.ratingId
      const user_id = req.user.id
      const { rating, comment } = req.body

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'rating phải từ 1-5'
        })
      }

      const ratingDoc = await feedbackService.updateRating({
        rating_id,
        user_id,
        rating,
        comment
      })

      res.status(200).json({
        success: true,
        data: ratingDoc,
        message: 'Đánh giá đã được cập nhật'
      })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  // 6.2. Xóa đánh giá
  deleteRating: async (req, res) => {
    try {
      const rating_id = req.params.ratingId
      const user_id = req.user.id

      const result = await feedbackService.deleteRating({
        rating_id,
        user_id
      })

      res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  // 7. Admin/Support: Lấy tất cả feedbacks
  getAllFeedbacks: async (req, res) => {
    try {
      const { status, category_id, priority, page, limit } = req.query

      const result = await feedbackService.getAllFeedbacks({
        status,
        category_id,
        priority,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      })

      res.status(200).json({ success: true, data: result })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // 8. Admin/Support: Cập nhật feedback
  updateFeedback: async (req, res) => {
    try {
      const feedback_id = req.params.id
      const { status, assigned_to, priority } = req.body

      const feedback = await feedbackService.updateFeedbackStatus({
        feedback_id,
        status,
        assigned_to,
        priority
      })

      res.status(200).json({
        success: true,
        data: feedback,
        message: 'Feedback đã được cập nhật'
      })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  }
}

module.exports = feedbackController
