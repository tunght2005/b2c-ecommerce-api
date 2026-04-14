const bcrypt = require('bcrypt')
const UserModel = require('./user.model')

const UserService = {
  getProfile: async (id) => {
    const user = await UserModel.findById(id)
    if (!user) throw { status: 404, message: 'User không tồn tại' }
    return user
  },

  updateProfile: async (id, { username, phone, avatar }) => {
    if (!username && !phone && !avatar) {
      throw { status: 400, message: 'Không có thông tin cần cập nhật' }
    }

    // Lấy thông tin hiện tại
    const current = await UserModel.findById(id)
    if (!current) throw { status: 404, message: 'User không tồn tại' }

    await UserModel.update(id, {
      username: username || current.username,
      phone: phone || current.phone,
      avatar: avatar || current.avatar
    })

    return await UserModel.findById(id)
  },

  changePassword: async (id, { oldPassword, newPassword }) => {
    if (!oldPassword || !newPassword) {
      throw { status: 400, message: 'Thiếu thông tin bắt buộc' }
    }

    const user = await UserModel.findPasswordById(id)
    if (!user) throw { status: 404, message: 'User không tồn tại' }

    const match = await bcrypt.compare(oldPassword, user.password)
    if (!match) throw { status: 401, message: 'Mật khẩu cũ không đúng' }

    if (newPassword.length < 6) {
      throw { status: 400, message: 'Mật khẩu mới phải ít nhất 6 ký tự' }
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await UserModel.updatePassword(id, hashed)

    return { message: 'Đổi mật khẩu thành công' }
  }
}

module.exports = UserService
