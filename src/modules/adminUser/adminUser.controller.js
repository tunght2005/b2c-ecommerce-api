const AdminUserService = require('./adminUser.service')

const AdminUserController = {
  list: async (req, res) => {
    try {
      const data = await AdminUserService.list(req.query)
      res.json(data)
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  },

  detail: async (req, res) => {
    try {
      const user = await AdminUserService.detail(req.params.id)
      res.json({ user })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  },

  create: async (req, res) => {
    try {
      const { username, email, password, phone, avatar, role, status } = req.body
      const user = await AdminUserService.create({ username, email, password, phone, avatar, role, status })
      res.status(201).json({ message: 'Tạo user thành công', user })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  },

  update: async (req, res) => {
    try {
      const { username, email, password, phone, avatar, role, status } = req.body
      const user = await AdminUserService.update(req.params.id, {
        username,
        email,
        password,
        phone,
        avatar,
        role,
        status
      })
      res.json({ message: 'Cập nhật user thành công', user })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  },

  remove: async (req, res) => {
    try {
      await AdminUserService.remove(req.params.id)
      res.json({ message: 'Xoá user thành công' })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  }
}

module.exports = AdminUserController
