const UserService = require('./user.service')

const UserController = {
  getProfile: async (req, res) => {
    try {
      const user = await UserService.getProfile(req.user.id)
      res.json({ user })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { username, phone } = req.body
      const user = await UserService.updateProfile(req.user.id, { username, phone })
      res.json({ message: 'Cập nhật thành công', user })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  },

  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body
      const result = await UserService.changePassword(req.user.id, { oldPassword, newPassword })
      res.json(result)
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  }
}

module.exports = UserController
