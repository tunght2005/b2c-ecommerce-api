const mongoose = require('mongoose')
const reviewService = require('./review.service')

const reviewController = {
  createReview: async (req, res) => {
    try {
      const user_id = req.user.id
      const { product_id, rating, content } = req.body

      if (!product_id || !mongoose.Types.ObjectId.isValid(product_id)) {
        return res.status(400).json({ success: false, message: 'product_id không hợp lệ' })
      }

      if (!rating || Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({ success: false, message: 'rating phải từ 1 đến 5' })
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, message: 'content là bắt buộc' })
      }

      const review = await reviewService.createReview({
        user_id,
        product_id,
        rating: Number(rating),
        content: content.trim()
      })

      return res.status(201).json({
        success: true,
        message: 'Tạo review thành công',
        data: review
      })
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  },

  getReviewsByProduct: async (req, res) => {
    try {
      const { productId } = req.params
      const { page = 1, limit = 10 } = req.query

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'productId không hợp lệ' })
      }

      const result = await reviewService.getReviewsByProduct(productId, Number(page), Number(limit))

      return res.status(200).json({ success: true, data: result })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  },

  getAllReviewsAdmin: async (req, res) => {
    try {
      const result = await reviewService.getAllReviewsAdmin(req.query)
      return res.status(200).json({ success: true, data: result })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  },

  getMyReviews: async (req, res) => {
    try {
      const user_id = req.user.id
      const { page = 1, limit = 10 } = req.query

      const result = await reviewService.getMyReviews(user_id, Number(page), Number(limit))

      return res.status(200).json({ success: true, data: result })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  },

  updateReview: async (req, res) => {
    try {
      const user_id = req.user.id
      const { id: review_id } = req.params
      const { rating, content } = req.body

      if (!mongoose.Types.ObjectId.isValid(review_id)) {
        return res.status(400).json({ success: false, message: 'review_id không hợp lệ' })
      }

      if (!rating || Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({ success: false, message: 'rating phải từ 1 đến 5' })
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, message: 'content là bắt buộc' })
      }

      const review = await reviewService.updateReview({
        review_id,
        user_id,
        rating: Number(rating),
        content: content.trim()
      })

      return res.status(200).json({
        success: true,
        message: 'Cập nhật review thành công',
        data: review
      })
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  },

  deleteReview: async (req, res) => {
    try {
      const user_id = req.user.id
      const { id: review_id } = req.params

      if (!mongoose.Types.ObjectId.isValid(review_id)) {
        return res.status(400).json({ success: false, message: 'review_id không hợp lệ' })
      }

      const result = await reviewService.deleteReview({ review_id, user_id })

      return res.status(200).json({ success: true, message: result.message })
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  },

  deleteReviewByAdmin: async (req, res) => {
    try {
      const { id: review_id } = req.params

      if (!mongoose.Types.ObjectId.isValid(review_id)) {
        return res.status(400).json({ success: false, message: 'review_id không hợp lệ' })
      }

      const result = await reviewService.deleteReviewByAdmin(review_id)

      return res.status(200).json({ success: true, message: result.message })
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  }
}

module.exports = reviewController
