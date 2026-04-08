const Feedback = require('./feedback.model')
const FeedbackReply = require('./feedbackReply.model')
const FeedbackAttachment = require('./feedbackAttachment.model')
const FeedbackRating = require('./feedbackRating.model')
const { User } = require('../auth/auth.model')

const feedbackService = {
  // 1. Tạo feedback ticket mới
  createFeedback: async ({ user_id, order_id, product_id, title, content, priority = 'medium' }) => {
    // Validate: either order_id or product_id must be provided
    if (!order_id && !product_id) {
      throw new Error('Phải cung cấp order_id hoặc product_id')
    }

    // If order_id provided, validate it belongs to user
    if (order_id) {
      const Order = require('../order/order.model')
      const order = await Order.findOne({ _id: order_id, user_id })
      if (!order) {
        throw new Error('Đơn hàng không tồn tại hoặc không thuộc về bạn')
      }
    }

    // If product_id provided, validate product exists
    if (product_id) {
      const Product = require('../product/product.model')
      const product = await Product.findById(product_id)
      if (!product) {
        throw new Error('Sản phẩm không tồn tại')
      }
    }

    const feedback = new Feedback({
      user_id,
      order_id,
      product_id,
      title,
      content,
      priority
    })

    await feedback.save()
    return feedback
  },

  // 2. Lấy danh sách feedback của user
  getUserFeedbacks: async (user_id) => {
    return await Feedback.find({ user_id })
      .populate('order_id', 'final_price status')
      .populate('assigned_to', 'username')
      .sort({ createdAt: -1 })
  },

  // 3. Lấy chi tiết feedback
  getFeedbackDetail: async (feedback_id, user_id) => {
    const feedback = await Feedback.findById(feedback_id)
      .populate('order_id', 'final_price status')
      .populate('assigned_to', 'username')
      .populate('user_id', 'username email')

    if (!feedback) {
      throw new Error('Feedback không tồn tại')
    }

    // Check permission: user can only see their own feedback, support can see all
    const user = await User.findById(user_id)
    if (user.role !== 'admin' && user.role !== 'support' && feedback.user_id.toString() !== user_id) {
      throw new Error('Bạn không có quyền xem feedback này')
    }

    return feedback
  },

  // 4. Reply to feedback
  replyToFeedback: async ({ feedback_id, user_id, content, is_internal = false }) => {
    const feedback = await Feedback.findById(feedback_id)
    if (!feedback) {
      throw new Error('Feedback không tồn tại')
    }

    // Check permission
    const user = await User.findById(user_id)
    const isOwner = feedback.user_id.toString() === user_id
    const isSupport = ['admin', 'support'].includes(user.role)

    if (!isOwner && !isSupport) {
      throw new Error('Bạn không có quyền reply feedback này')
    }

    // Internal notes only for support staff
    if (is_internal && !isSupport) {
      throw new Error('Chỉ support staff mới có thể tạo internal note')
    }

    const reply = new FeedbackReply({
      feedback_id,
      user_id,
      content,
      is_internal
    })

    await reply.save()

    // Update feedback status if support replies
    if (isSupport && feedback.status === 'open') {
      await Feedback.findByIdAndUpdate(feedback_id, { status: 'in_progress' })
    }

    return reply
  },

  // 5. Get feedback replies
  getFeedbackReplies: async (feedback_id, user_id) => {
    const feedback = await Feedback.findById(feedback_id)
    if (!feedback) {
      throw new Error('Feedback không tồn tại')
    }

    // Check permission
    const user = await User.findById(user_id)
    const isOwner = feedback.user_id.toString() === user_id
    const isSupport = ['admin', 'support'].includes(user.role)

    if (!isOwner && !isSupport) {
      throw new Error('Bạn không có quyền xem replies này')
    }

    const replies = await FeedbackReply.find({ feedback_id })
      .populate('user_id', 'username role')
      .sort({ createdAt: 1 })

    // Filter out internal notes for non-support users
    if (!isSupport) {
      return replies.filter(reply => !reply.is_internal)
    }

    return replies
  },

  // 6. Rate feedback resolution
  rateFeedback: async ({ feedback_id, user_id, rating, comment }) => {
    const feedback = await Feedback.findById(feedback_id)
    if (!feedback) {
      throw new Error('Feedback không tồn tại')
    }

    if (feedback.user_id.toString() !== user_id) {
      throw new Error('Bạn chỉ có thể đánh giá feedback của mình')
    }

    if (feedback.status !== 'resolved' && feedback.status !== 'closed') {
      throw new Error('Chỉ có thể đánh giá feedback đã được giải quyết')
    }

    // Check if feedback is related to an order and shipment is delivered
    if (feedback.order_id) {
      const Shipment = require('../shipment/shipment.model')
      const shipment = await Shipment.findOne({ order_id: feedback.order_id })
      if (!shipment) {
        throw new Error('Không tìm thấy thông tin giao hàng cho đơn hàng này')
      }
      if (shipment.status !== 'delivered') {
        throw new Error('Chỉ có thể đánh giá feedback khi đơn hàng đã được giao thành công')
      }
    }

    // Check if already rated
    const existingRating = await FeedbackRating.findOne({ feedback_id, user_id })
    if (existingRating) {
      throw new Error('Bạn đã đánh giá feedback này rồi')
    }

    const ratingDoc = new FeedbackRating({
      feedback_id,
      user_id,
      rating,
      comment
    })

    await ratingDoc.save()
    return ratingDoc
  },

  // 6.1. Update rating
  updateRating: async ({ rating_id, user_id, rating, comment }) => {
    const existingRating = await FeedbackRating.findById(rating_id)
    if (!existingRating) {
      throw new Error('Đánh giá không tồn tại')
    }

    if (existingRating.user_id.toString() !== user_id) {
      throw new Error('Bạn chỉ có thể sửa đánh giá của mình')
    }

    existingRating.rating = rating
    existingRating.comment = comment
    existingRating.updatedAt = new Date()

    await existingRating.save()
    return existingRating
  },

  // 6.2. Delete rating
  deleteRating: async ({ rating_id, user_id }) => {
    const existingRating = await FeedbackRating.findById(rating_id)
    if (!existingRating) {
      throw new Error('Đánh giá không tồn tại')
    }

    if (existingRating.user_id.toString() !== user_id) {
      throw new Error('Bạn chỉ có thể xóa đánh giá của mình')
    }

    await FeedbackRating.findByIdAndDelete(rating_id)
    return { message: 'Đánh giá đã được xóa' }
  },

  // 7. Admin/Support: Get all feedbacks
  getAllFeedbacks: async ({ status, category_id, priority, page = 1, limit = 10 }) => {
    const query = {}
    if (status) query.status = status
    if (priority) query.priority = priority

    const feedbacks = await Feedback.find(query)
      .populate('user_id', 'username email')
      .populate('assigned_to', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Feedback.countDocuments(query)

    return {
      feedbacks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  },

  // 8. Admin/Support: Update feedback status
  updateFeedbackStatus: async ({ feedback_id, status, assigned_to, priority }) => {
    const updateData = { status }
    if (assigned_to) updateData.assigned_to = assigned_to
    if (priority) updateData.priority = priority

    const feedback = await Feedback.findByIdAndUpdate(feedback_id, updateData, { new: true })
      .populate('assigned_to', 'username')

    if (!feedback) {
      throw new Error('Feedback không tồn tại')
    }

    return feedback
  }
}

module.exports = feedbackService
