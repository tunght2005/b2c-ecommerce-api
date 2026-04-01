const db = require('../../database/db')

const NotificationModel = {
  findAllByUserId: async (userId) => {
    const [rows] = await db.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId])
    return rows
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM notifications WHERE id = ? LIMIT 1', [id])
    return rows[0] || null
  },

  markAsRead: async (id, userId) => {
    const [result] = await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [
      id,
      userId
    ])
    return result.affectedRows
  },

  markAllAsRead: async (userId) => {
    const [result] = await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId])
    return result.affectedRows
  }
}

module.exports = NotificationModel
