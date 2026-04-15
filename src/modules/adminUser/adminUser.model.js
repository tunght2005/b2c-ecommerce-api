const bcrypt = require('bcrypt')
const { User } = require('../auth/auth.model')

const allowedSortFields = ['createdAt', 'updatedAt', 'username', 'email', 'role', 'status']
const allowedRoles = ['customer', 'admin', 'shipper', 'support']
const allowedStatuses = ['active', 'inactive']

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeNumber(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function normalizeSortField(sortBy) {
  return allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'
}

function normalizeSortOrder(sortOrder) {
  return String(sortOrder).toLowerCase() === 'asc' ? 1 : -1
}

function buildFilter({ search, role, status }) {
  const filter = {}
  const keyword = String(search || '').trim()

  if (keyword) {
    const regex = new RegExp(escapeRegex(keyword), 'i')
    filter.$or = [{ username: regex }, { email: regex }, { phone: regex }]
  }

  if (role && role !== 'all' && allowedRoles.includes(role)) {
    filter.role = role
  }

  if (status && status !== 'all' && allowedStatuses.includes(status)) {
    filter.status = status
  }

  return filter
}

async function toSafeUser(userId) {
  return await User.findById(userId).select('-password')
}

async function assertEmailAvailable(email, userId) {
  if (!email) return

  const existing = await User.findOne({ email })
  if (existing && existing._id.toString() !== userId?.toString()) {
    throw { status: 409, message: 'Email đã tồn tại' }
  }
}

const AdminUserModel = {
  list: async ({ search, role, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    const filter = buildFilter({ search, role, status })
    const normalizedLimit = normalizeNumber(limit, 10)
    const totalItems = await User.countDocuments(filter)
    const totalPages = Math.max(1, Math.ceil(totalItems / normalizedLimit))
    const normalizedPage = Math.min(normalizeNumber(page, 1), totalPages)
    const normalizedSortField = normalizeSortField(sortBy)
    const normalizedSortOrder = normalizeSortOrder(sortOrder)

    const users = await User.find(filter)
      .select('-password')
      .sort({ [normalizedSortField]: normalizedSortOrder })
      .skip((normalizedPage - 1) * normalizedLimit)
      .limit(normalizedLimit)

    const [totalUsers, activeUsers, adminUsers, supportUsers, shipperUsers, customers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'support' }),
      User.countDocuments({ role: 'shipper' }),
      User.countDocuments({ role: 'customer' })
    ])

    const adminSupportUsers = adminUsers + supportUsers + shipperUsers

    return {
      users,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        totalItems,
        totalPages
      },
      summary: {
        totalUsers,
        activeUsers,
        adminUsers,
        supportUsers,
        shipperUsers,
        adminSupportUsers,
        customers
      }
    }
  },

  detail: async (id) => {
    return await toSafeUser(id)
  },

  create: async ({ username, email, password, phone, avatar, role = 'customer', status = 'active' }) => {
    if (!username || !email || !password) {
      throw { status: 400, message: 'Thiếu thông tin bắt buộc' }
    }

    await assertEmailAvailable(email)

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
      username,
      email,
      password: hashedPassword,
      phone: phone || null,
      avatar: avatar || null,
      role,
      status
    })

    const saved = await user.save()
    return await toSafeUser(saved._id)
  },

  update: async (id, { username, email, password, phone, avatar, role, status }) => {
    const current = await User.findById(id)
    if (!current) {
      throw { status: 404, message: 'User không tồn tại' }
    }

    if (email && email !== current.email) {
      await assertEmailAvailable(email, id)
    }

    const payload = {
      username: username ?? current.username,
      email: email ?? current.email,
      phone: phone !== undefined ? phone || null : current.phone,
      avatar: avatar !== undefined ? avatar || null : current.avatar,
      role: role ?? current.role,
      status: status ?? current.status
    }

    if (password) {
      payload.password = await bcrypt.hash(password, 10)
    }

    await User.findByIdAndUpdate(id, payload, { new: true })
    return await toSafeUser(id)
  },

  remove: async (id) => {
    const deleted = await User.findByIdAndDelete(id)
    if (!deleted) {
      throw { status: 404, message: 'User không tồn tại' }
    }
    return deleted
  }
}

module.exports = AdminUserModel
