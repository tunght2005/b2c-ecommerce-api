const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: null },
    avatar: { type: String, default: null },
    role: { type: String, enum: ['customer', 'admin', 'shipper', 'support'], default: 'customer' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true } // tự tạo createdAt, updatedAt
)

const User = mongoose.model('User', userSchema)

const AuthModel = {
  findByEmail: async (email) => {
    return await User.findOne({ email })
  },

  findById: async (id) => {
    return await User.findById(id)
  },

  create: async ({ username, email, password, phone, avatar, role }) => {
    const user = new User({ username, email, password, phone, avatar, role })
    return await user.save()
  }
}

module.exports = { AuthModel, User }
