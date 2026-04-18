const { NotificationModel } = require('./notification.model')

const NotificationService = {
  create: async ({ userId, title, content }) => {
    return await NotificationModel.create({ user_id: userId, title, content })
  },

  getAll: async (userId) => {
    return await NotificationModel.findAllByUserId(userId)
  },

  markAsRead: async (userId, id) => {
    const notif = await NotificationModel.findById(id)
    if (!notif) {
      const err = new Error('Thông báo không tồn tại')
      err.status = 404
      throw err
    }
    if (notif.user_id.toString() !== userId.toString()) {
      const err = new Error('Không có quyền')
      err.status = 403
      throw err
    }
    return await NotificationModel.markAsRead(id, userId)
  },

  markAllAsRead: async (userId) => {
    await NotificationModel.markAllAsRead(userId)
  }
}

module.exports = NotificationService
