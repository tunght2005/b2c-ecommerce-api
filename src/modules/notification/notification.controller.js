const NotificationService = require('./notification.service')

const NotificationController = {
  createBroadcastAll: async (req, res) => {
    try {
      const { title, content } = req.body

      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Thiếu title' })
      }

      const result = await NotificationService.broadcastAllUsers({
        title: title.trim(),
        content: content?.trim() || null,
        createdBy: req.user.id,
        category: 'marketing'
      })

      res.status(201).json({
        message: 'Đã gửi thông báo đến toàn bộ user',
        total: result.totalRecipients,
        notification: result.notification
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
        content: content?.trim() || null,
        createdBy: req.user.id,
        category: 'system'
      })

      res.status(201).json({ message: 'Tạo thông báo thành công', notification })
    } catch (err) {
      const status = typeof err.status === 'number' ? err.status : 500
      res.status(status).json({ message: err.message || 'Lỗi server' })
    }
  },

  getAll: async (req, res) => {
    try {
      const notifications = await NotificationService.getAll({
        userId: req.user.id,
        role: req.user.role
      })
      res.json({ notifications })
    } catch (err) {
      const status = typeof err.status === 'number' ? err.status : 500
      res.status(status).json({ message: err.message || 'Lỗi server' })
    }
  },

  markAsRead: async (req, res) => {
    try {
      const notif = await NotificationService.markAsRead({
        userId: req.user.id,
        role: req.user.role,
        id: req.params.id
      })
      res.json({ message: 'Đã đánh dấu đã đọc', notification: notif })
    } catch (err) {
      const status = typeof err.status === 'number' ? err.status : 500
      res.status(status).json({ message: err.message || 'Lỗi server' })
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      const result = await NotificationService.markAllAsRead({
        userId: req.user.id,
        role: req.user.role
      })
      res.json({
        message: 'Đã đánh dấu tất cả đã đọc',
        total: result.total,
        updated: result.insertedCount
      })
    } catch (err) {
      const status = typeof err.status === 'number' ? err.status : 500
      res.status(status).json({ message: err.message || 'Lỗi server' })
    }
  }
}

module.exports = NotificationController
