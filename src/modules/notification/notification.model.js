const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    type: { type: String, enum: ['personal', 'global'], default: 'personal' },
    category: { type: String, enum: ['system', 'marketing'], default: 'system' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    title: { type: String, required: true },
    content: { type: String, default: null }
  },
  { timestamps: true }
)

notificationSchema.index({ type: 1, createdAt: -1 })
notificationSchema.index({ user_id: 1, createdAt: -1 })

const Notification = mongoose.model('Notification', notificationSchema)

const NotificationModel = {
  createPersonal: async ({ user_id, title, content = null, category = 'system', created_by = null }) => {
    return await Notification.create({
      user_id,
      type: 'personal',
      category,
      created_by,
      title,
      content
    })
  },

  createGlobal: async ({ title, content = null, category = 'marketing', created_by = null }) => {
    return await Notification.create({
      type: 'global',
      category,
      created_by,
      title,
      content
    })
  },

  findVisibleByUser: async ({ userId, role }) => {
    const isStaff = ['admin', 'support'].includes(role)

    const query = isStaff
      ? {}
      : {
          $or: [
            { type: 'global' },
            {
              user_id: userId,
              $or: [{ type: 'personal' }, { type: { $exists: false } }, { type: null }]
            }
          ]
        }

    return await Notification.find(query).sort({ createdAt: -1 })
  },

  findById: async (id) => {
    return await Notification.findById(id)
  },

  findVisibleIdsByUser: async ({ userId, role }) => {
    const isStaff = ['admin', 'support'].includes(role)

    const query = isStaff
      ? {}
      : {
          $or: [
            { type: 'global' },
            {
              user_id: userId,
              $or: [{ type: 'personal' }, { type: { $exists: false } }, { type: null }]
            }
          ]
        }

    const docs = await Notification.find(query).select('_id')
    return docs.map((doc) => doc._id)
  }
}

module.exports = { NotificationModel, Notification }
