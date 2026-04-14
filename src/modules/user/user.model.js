const { User } = require('../auth/auth.model')

const UserModel = {
  findById: async (id) => {
    return await User.findById(id).select('-password')
  },

  update: async (id, { username, phone }) => {
    return await User.findByIdAndUpdate(id, { username, phone }, { new: true }).select('-password')
  },

  updatePassword: async (id, hashedPassword) => {
    return await User.findByIdAndUpdate(id, { password: hashedPassword })
  },

  findPasswordById: async (id) => {
    return await User.findById(id).select('password')
  }
}

module.exports = UserModel
