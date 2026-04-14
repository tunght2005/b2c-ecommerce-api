const NotificationService = require('./notification.service')

const NotificationController = {
  getAll: async (req, res) => {
    try {
      const notifications = await NotificationService.getAll(req.user.id)
      res.json({ notifications })
    } catch (err) {
      const status = typeof err.status === 'number' ? err.status : 500
      res.status(status).json({ message: err.message || 'Lỗi server' })
    }
  },

  markAsRead: async (req, res) => {
    try {
      const notif = await NotificationService.markAsRead(req.user.id, req.params.id)
      res.json({ message: 'Đã đánh dấu đã đọc', notification: notif })
    } catch (err) {
      const status = typeof err.status === 'number' ? err.status : 500
      res.status(status).json({ message: err.message || 'Lỗi server' })
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      await NotificationService.markAllAsRead(req.user.id)
      res.json({ message: 'Đã đánh dấu tất cả đã đọc' })
    } catch (err) {
      const status = typeof err.status === 'number' ? err.status : 500
      res.status(status).json({ message: err.message || 'Lỗi server' })
    }
  }
}

module.exports = NotificationController
