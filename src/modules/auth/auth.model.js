const db = require('../../database/db')

const AuthModel = {
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
    return rows[0] || null
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id])
    return rows[0] || null
  },

  create: async ({ username, email, password, phone, role }) => {
    const [result] = await db.query(
      `INSERT INTO users (username, email, password, phone, role, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'active', NOW())`,
      [username, email, password, phone, role]
    )
    return result.insertId
  }
}

module.exports = AuthModel
