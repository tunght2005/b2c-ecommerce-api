const NotificationService = require('./notification.service')

const NotificationController = {
  getAll: async (req, res) => {
    try {
      const notifications = await NotificationService.getAll(req.user.id)
      res.json({ notifications })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  },

  markAsRead: async (req, res) => {
    try {
      const notif = await NotificationService.markAsRead(req.user.id, parseInt(req.params.id))
      res.json({ message: 'Đã đánh dấu đã đọc', notification: notif })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      await NotificationService.markAllAsRead(req.user.id)
      res.json({ message: 'Đã đánh dấu tất cả đã đọc' })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  }
}

module.exports = NotificationController
