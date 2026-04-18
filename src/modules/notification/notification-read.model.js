const mongoose = require('mongoose')

const notificationReadSchema = new mongoose.Schema(
  {
    notification_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    read_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

notificationReadSchema.index({ notification_id: 1, user_id: 1 }, { unique: true })
notificationReadSchema.index({ user_id: 1, read_at: -1 })

const NotificationRead = mongoose.model('NotificationRead', notificationReadSchema)

const NotificationReadModel = {
  findReadNotificationIds: async ({ userId, notificationIds }) => {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) return []

    const reads = await NotificationRead.find({
      user_id: userId,
      notification_id: { $in: notificationIds }
    }).select('notification_id')

    return reads.map((item) => item.notification_id.toString())
  },

  upsertRead: async ({ userId, notificationId }) => {
    return await NotificationRead.findOneAndUpdate(
      { user_id: userId, notification_id: notificationId },
      { $set: { read_at: new Date() } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
  },

  bulkMarkAsRead: async ({ userId, notificationIds }) => {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) return 0

    const existing = await NotificationRead.find({
      user_id: userId,
      notification_id: { $in: notificationIds }
    }).select('notification_id')

    const existingSet = new Set(existing.map((item) => item.notification_id.toString()))

    const docs = notificationIds
      .filter((id) => !existingSet.has(id.toString()))
      .map((id) => ({
        user_id: userId,
        notification_id: id,
        read_at: new Date()
      }))

    if (!docs.length) return 0

    await NotificationRead.insertMany(docs, { ordered: false })
    return docs.length
  }
}

module.exports = { NotificationReadModel, NotificationRead }
