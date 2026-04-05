const { AddressModel } = require('./address.model')

const AddressService = {
  getAll: async (userId) => {
    return await AddressModel.findAllByUserId(userId)
  },

  create: async (userId, data) => {
    const { receiver_name, phone, province, district, ward, detail, latitude, longitude } = data
    if (!receiver_name || !phone || !province || !district || !ward || !detail) {
      const err = new Error('Thiếu thông tin bắt buộc')
      err.status = 400
      throw err
    }
    return await AddressModel.create({
      user_id: userId,
      receiver_name,
      phone,
      province,
      district,
      ward,
      detail,
      latitude,
      longitude
    })
  },

  update: async (userId, id, data) => {
    const address = await AddressModel.findById(id)
    if (!address) {
      const err = new Error('Địa chỉ không tồn tại')
      err.status = 404
      throw err
    }
    if (address.user_id.toString() !== userId.toString()) {
      const err = new Error('Không có quyền chỉnh sửa')
      err.status = 403
      throw err
    }

    const { receiver_name, phone, province, district, ward, detail, latitude, longitude } = data
    return await AddressModel.update(id, {
      receiver_name: receiver_name || address.receiver_name,
      phone: phone || address.phone,
      province: province || address.province,
      district: district || address.district,
      ward: ward || address.ward,
      detail: detail || address.detail,
      latitude: latitude ?? address.latitude,
      longitude: longitude ?? address.longitude
    })
  },

  delete: async (userId, id) => {
    const address = await AddressModel.findById(id)
    if (!address) {
      const err = new Error('Địa chỉ không tồn tại')
      err.status = 404
      throw err
    }
    if (address.user_id.toString() !== userId.toString()) {
      const err = new Error('Không có quyền xóa')
      err.status = 403
      throw err
    }
    await AddressModel.delete(id)
  },

  setDefault: async (userId, id) => {
    const address = await AddressModel.findById(id)
    if (!address) {
      const err = new Error('Địa chỉ không tồn tại')
      err.status = 404
      throw err
    }
    if (address.user_id.toString() !== userId.toString()) {
      const err = new Error('Không có quyền')
      err.status = 403
      throw err
    }
    await AddressModel.setDefault(userId, id)
    return await AddressModel.findById(id)
  }
}

module.exports = AddressService
