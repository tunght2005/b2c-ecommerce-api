const db = require('../../database/db')

const AddressModel = {
  findAllByUserId: async (userId) => {
    const [rows] = await db.query('SELECT * FROM user_address WHERE user_id = ? ORDER BY is_default DESC', [userId])
    return rows
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM user_address WHERE id = ? LIMIT 1', [id])
    return rows[0] || null
  },

  create: async ({ user_id, receiver_name, phone, province, district, ward, detail, latitude, longitude }) => {
    const [result] = await db.query(
      `INSERT INTO user_address (user_id, receiver_name, phone, province, district, ward, detail, latitude, longitude, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [user_id, receiver_name, phone, province, district, ward, detail, latitude, longitude]
    )
    return result.insertId
  },

  update: async (id, { receiver_name, phone, province, district, ward, detail, latitude, longitude }) => {
    const [result] = await db.query(
      `UPDATE user_address SET receiver_name=?, phone=?, province=?, district=?, ward=?, detail=?, latitude=?, longitude=?
       WHERE id=?`,
      [receiver_name, phone, province, district, ward, detail, latitude, longitude, id]
    )
    return result.affectedRows
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM user_address WHERE id = ?', [id])
    return result.affectedRows
  },

  // Bỏ default tất cả → set default 1 cái
  setDefault: async (userId, id) => {
    await db.query('UPDATE user_address SET is_default = FALSE WHERE user_id = ?', [userId])
    await db.query('UPDATE user_address SET is_default = TRUE WHERE id = ? AND user_id = ?', [id, userId])
  }
}

module.exports = AddressModel
