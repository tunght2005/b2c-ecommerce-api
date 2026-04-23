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
      Review.find({ product_id })
        .populate('user_id', 'username email')
        .populate('admin_reply.user_id', 'username role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
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

  getAllReviewsAdmin: async ({ page = 1, limit = 20, product_id, user_id, rating } = {}) => {
    const currentPage = Math.max(1, Number(page) || 1)
    const pageSize = Math.max(1, Number(limit) || 20)
    const skip = (currentPage - 1) * pageSize

    const filter = {}
    if (product_id && mongoose.Types.ObjectId.isValid(product_id)) {
      filter.product_id = product_id
    }
    if (user_id && mongoose.Types.ObjectId.isValid(user_id)) {
      filter.user_id = user_id
    }
    if (rating) {
      filter.rating = Number(rating)
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user_id', 'username email')
        .populate('product_id', 'name slug')
        .populate('admin_reply.user_id', 'username role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Review.countDocuments(filter)
    ])

    return {
      reviews,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  },

  getMyReviews: async (user_id, page = 1, limit = 10) => {
    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      Review.find({ user_id })
        .populate('product_id', 'name slug')
        .populate('admin_reply.user_id', 'username role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
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
  },

  deleteReviewByAdmin: async (review_id) => {
    const deleted = await Review.findByIdAndDelete(review_id)

    if (!deleted) {
      throw new Error('Không tìm thấy review')
    }

    return { message: 'Đã xóa review thành công' }
  },

  replyReviewByAdmin: async ({ review_id, user_id, role, content }) => {
    const review = await Review.findById(review_id)

    if (!review) {
      throw new Error('Không tìm thấy review')
    }

    const now = new Date()
    const previousCreatedAt = review.admin_reply?.createdAt

    review.admin_reply = {
      content: content.trim(),
      user_id,
      role,
      createdAt: previousCreatedAt || now,
      updatedAt: now
    }

    await review.save()

    return await Review.findById(review_id)
      .populate('user_id', 'username email')
      .populate('product_id', 'name slug')
      .populate('admin_reply.user_id', 'username role')
  }
}

module.exports = reviewService
