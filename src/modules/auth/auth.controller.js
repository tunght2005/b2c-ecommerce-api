const AuthService = require('./auth.service')

const AuthController = {
  register: async (req, res) => {
    try {
      const { username, email, password, phone, role } = req.body
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' })
      }
      const user = await AuthService.register({ username, email, password, phone, role })
      res.status(201).json({ message: 'Đăng ký thành công', user })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu' })
      }
      const data = await AuthService.login({ email, password })
      res.json({ message: 'Đăng nhập thành công', ...data })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body
      const data = await AuthService.refreshToken(refreshToken)
      res.json(data)
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  },

  logout: async (req, res) => {
    try {
      res.json({ message: 'Đăng xuất thành công' })
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server' })
    }
  }
}

module.exports = AuthController
