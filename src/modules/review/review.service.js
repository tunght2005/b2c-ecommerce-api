const Review = require('./review.model')
const mongoose = require('mongoose')

const reviewService = {
  createReview: async ({ user_id, product_id, rating, content }) => {
    const existing = await Review.findOne({ user_id, product_id })

    if (existing) {
      throw new Error('Bạn đã đánh giá sản phẩm này rồi, vui lòng cập nhật đánh giá hiện có')
    }

    return await Review.create({ user_id, product_id, rating, content })
  },

  getReviewsByProduct: async (product_id, page = 1, limit = 10) => {
    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      Review.find({ product_id }).populate('user_id', 'username email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Review.countDocuments({ product_id })
    ])

    const productObjectId = new mongoose.Types.ObjectId(product_id)

    const [summary] = await Review.aggregate([
      { $match: { product_id: productObjectId } },
      {
        $group: {
          _id: '$product_id',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ])

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        averageRating: summary?.averageRating || 0,
        totalReviews: summary?.totalReviews || 0
      }
    }
  },

  getMyReviews: async (user_id, page = 1, limit = 10) => {
    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      Review.find({ user_id }).populate('product_id', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Review.countDocuments({ user_id })
    ])

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  updateReview: async ({ review_id, user_id, rating, content }) => {
    const review = await Review.findOne({ _id: review_id, user_id })

    if (!review) {
      throw new Error('Không tìm thấy review hoặc bạn không có quyền chỉnh sửa')
    }

    review.rating = rating
    review.content = content
    await review.save()

    return review
  },

  deleteReview: async ({ review_id, user_id }) => {
    const deleted = await Review.findOneAndDelete({ _id: review_id, user_id })

    if (!deleted) {
      throw new Error('Không tìm thấy review hoặc bạn không có quyền xóa')
    }

    return { message: 'Đã xóa review thành công' }
  }
}

module.exports = reviewService
