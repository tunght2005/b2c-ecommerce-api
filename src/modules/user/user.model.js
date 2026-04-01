const db = require('../../database/db')

const UserModel = {
  findById: async (id) => {
    const [rows] = await db.query(
      'SELECT id, username, email, phone, role, status, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    )
    return rows[0] || null
  },

  update: async (id, { username, phone }) => {
    const [result] = await db.query('UPDATE users SET username = ?, phone = ? WHERE id = ?', [username, phone, id])
    return result.affectedRows
  },

  updatePassword: async (id, hashedPassword) => {
    const [result] = await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id])
    return result.affectedRows
  },

  findPasswordById: async (id) => {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ? LIMIT 1', [id])
    return rows[0] || null
  }
}

module.exports = UserModel
