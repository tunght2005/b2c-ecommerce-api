const { NotificationModel } = require('./notification.model')
const { NotificationReadModel } = require('./notification-read.model')
const { User } = require('../auth/auth.model')

const NotificationService = {
  create: async ({ userId, title, content, createdBy = null, category = 'system' }) => {
    return await NotificationModel.createPersonal({
      user_id: userId,
      title,
      content,
      category,
      created_by: createdBy
    })
  },

  broadcastAllUsers: async ({ title, content, createdBy = null, category = 'marketing' }) => {
    const notification = await NotificationModel.createGlobal({
      title,
      content,
      category,
      created_by: createdBy
    })

    const totalRecipients = await User.countDocuments({ status: 'active' })

    return {
      notification,
      totalRecipients
    }
  },

  getAll: async ({ userId, role }) => {
    const notifications = await NotificationModel.findVisibleByUser({ userId, role })
    const notificationIds = notifications.map((item) => item._id)
    const readIds = await NotificationReadModel.findReadNotificationIds({ userId, notificationIds })
    const readSet = new Set(readIds)

    return notifications.map((item) => {
      const raw = item.toObject()

      return {
        ...raw,
        is_read: readSet.has(raw._id.toString())
      }
    })
  },

  markAsRead: async ({ userId, role, id }) => {
    const notif = await NotificationModel.findById(id)
    if (!notif) {
      const err = new Error('Thông báo không tồn tại')
      err.status = 404
      throw err
    }

    const isStaff = ['admin', 'support'].includes(role)
    const isOwner = notif.user_id && notif.user_id.toString() === userId.toString()
    const isGlobal = notif.type === 'global'

    if (!isStaff && !isGlobal && !isOwner) {
      const err = new Error('Không có quyền')
      err.status = 403
      throw err
    }

    await NotificationReadModel.upsertRead({ userId, notificationId: id })

    const raw = notif.toObject()
    return {
      ...raw,
      is_read: true
    }
  },

  markAllAsRead: async ({ userId, role }) => {
    const notificationIds = await NotificationModel.findVisibleIdsByUser({ userId, role })
    const insertedCount = await NotificationReadModel.bulkMarkAsRead({ userId, notificationIds })

    return {
      insertedCount,
      total: notificationIds.length
    }
  },

  notifyMarketingBanner: async ({ bannerTitle, bannerLink = null, createdBy = null }) => {
    const title = 'Thong bao khuyen mai moi'
    const linkPart = bannerLink ? ` Xem ngay: ${bannerLink}` : ''
    const content = `Banner ${bannerTitle} da duoc cap nhat.${linkPart}`

    return await NotificationService.broadcastAllUsers({
      title,
      content,
      createdBy,
      category: 'marketing'
    })
  }
}

module.exports = NotificationService
