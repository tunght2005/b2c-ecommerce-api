const AdminUserModel = require('./adminUser.model')

const AdminUserService = {
  list: async (query) => {
    return await AdminUserModel.list(query)
  },

  detail: async (id) => {
    const user = await AdminUserModel.detail(id)
    if (!user) throw { status: 404, message: 'User không tồn tại' }
    return user
  },

  create: async (data) => {
    return await AdminUserModel.create(data)
  },

  update: async (id, data) => {
    return await AdminUserModel.update(id, data)
  },

  remove: async (id) => {
    return await AdminUserModel.remove(id)
  }
}

module.exports = AdminUserService
