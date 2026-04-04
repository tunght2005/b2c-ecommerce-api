const NotificationModel = require('./notification.model')

const NotificationService = {
  getAll: async (userId) => {
    return await NotificationModel.findAllByUserId(userId)
  },

  markAsRead: async (userId, id) => {
    const notif = await NotificationModel.findById(id)
    if (!notif) throw { status: 404, message: 'Thông báo không tồn tại' }
    if (notif.user_id !== userId) throw { status: 403, message: 'Không có quyền' }

    await NotificationModel.markAsRead(id, userId)
    return await NotificationModel.findById(id)
  },

  markAllAsRead: async (userId) => {
    await NotificationModel.markAllAsRead(userId)
  }
}

module.exports = NotificationService
