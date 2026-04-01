const bcrypt = require('bcrypt')
const AuthModel = require('./auth.model')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt')

const AuthService = {
  register: async ({ username, email, password, phone, role = 'customer' }) => {
    const existing = await AuthModel.findByEmail(email)
    if (existing) {
      throw { status: 409, message: 'Email đã được sử dụng' }
    }
    const hashed = await bcrypt.hash(password, 10)
    const userId = await AuthModel.create({ username, email, password: hashed, phone, role })
    return { id: userId, username, email, role }
  },

  login: async ({ email, password }) => {
    const user = await AuthModel.findByEmail(email)
    if (!user) throw { status: 401, message: 'Email hoặc mật khẩu không đúng' }
    if (user.status === 'inactive') throw { status: 403, message: 'Tài khoản đã bị khóa' }

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw { status: 401, message: 'Email hoặc mật khẩu không đúng' }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    }

    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken({ id: user.id })

    return { accessToken, refreshToken, user: payload }
  },

  refreshToken: async (token) => {
    if (!token) throw { status: 400, message: 'Thiếu refresh token' }

    let decoded
    try {
      decoded = verifyRefreshToken(token)
    } catch {
      throw { status: 401, message: 'Refresh token không hợp lệ hoặc đã hết hạn' }
    }

    const user = await AuthModel.findById(decoded.id)
    if (!user) throw { status: 401, message: 'User không tồn tại' }
    if (user.status === 'inactive') throw { status: 403, message: 'Tài khoản đã bị khóa' }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    }

    const accessToken = signAccessToken(payload)
    return { accessToken }
  }
}

module.exports = AuthService
