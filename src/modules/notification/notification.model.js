const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, default: null },
    is_read: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const Notification = mongoose.model('Notification', notificationSchema)

const NotificationModel = {
  create: async ({ user_id, title, content = null }) => {
    return await Notification.create({ user_id, title, content })
  },

  createMany: async ({ userIds, title, content = null }) => {
    if (!Array.isArray(userIds) || userIds.length === 0) return []

    const docs = userIds.map((userId) => ({
      user_id: userId,
      title,
      content
    }))

    return await Notification.insertMany(docs, { ordered: false })
  },

  findAllByUserId: async (userId) => {
    return await Notification.find({ user_id: userId }).sort({ createdAt: -1 })
  },

  findById: async (id) => {
    return await Notification.findById(id)
  },

  markAsRead: async (id, userId) => {
    return await Notification.findByIdAndUpdate(id, { is_read: true }, { new: true })
  },

  markAllAsRead: async (userId) => {
    return await Notification.updateMany({ user_id: userId }, { is_read: true })
  }
}

module.exports = { NotificationModel, Notification }
