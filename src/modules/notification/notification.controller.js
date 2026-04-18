const NotificationService = require('./notification.service')

const NotificationController = {
  createForCustomers: async (req, res) => {
    try {
      const { title, content } = req.body

      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Thiếu title' })
      }

      const notifications = await NotificationService.notifyAllActiveCustomers({
        title: title.trim(),
        content: content?.trim() || null
      })

      res.status(201).json({
        message: 'Đã gửi thông báo đến customer',
        total: notifications.length
      })
    } catch (err) {
      const status = typeof err.status === 'number' ? err.status : 500
      res.status(status).json({ message: err.message || 'Lỗi server' })
    }
  },

  create: async (req, res) => {
    try {
      const { title, content } = req.body

      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Thiếu title' })
      }

      const notification = await NotificationService.create({
        userId: req.user.id,
        title: title.trim(),
        content: content?.trim() || null
      })

      res.status(201).json({ message: 'Tạo thông báo thành công', notification })
    } catch (err) {
      const status = typeof err.status === 'number' ? err.status : 500
      res.status(status).json({ message: err.message || 'Lỗi server' })
    }
  },

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
