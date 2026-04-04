const AddressModel = require('./address.model')

const AddressService = {
  getAll: async (userId) => {
    return await AddressModel.findAllByUserId(userId)
  },

  create: async (userId, data) => {
    const { receiver_name, phone, province, district, ward, detail, latitude, longitude } = data
    if (!receiver_name || !phone || !province || !district || !ward || !detail) {
      throw { status: 400, message: 'Thiếu thông tin bắt buộc' }
    }
    const id = await AddressModel.create({
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
    return await AddressModel.findById(id)
  },

  update: async (userId, id, data) => {
    const address = await AddressModel.findById(id)
    if (!address) throw { status: 404, message: 'Địa chỉ không tồn tại' }
    if (address.user_id !== userId) throw { status: 403, message: 'Không có quyền chỉnh sửa địa chỉ này' }

    const { receiver_name, phone, province, district, ward, detail, latitude, longitude } = data
    await AddressModel.update(id, {
      receiver_name: receiver_name || address.receiver_name,
      phone: phone || address.phone,
      province: province || address.province,
      district: district || address.district,
      ward: ward || address.ward,
      detail: detail || address.detail,
      latitude: latitude ?? address.latitude,
      longitude: longitude ?? address.longitude
    })
    return await AddressModel.findById(id)
  },

  delete: async (userId, id) => {
    const address = await AddressModel.findById(id)
    if (!address) throw { status: 404, message: 'Địa chỉ không tồn tại' }
    if (address.user_id !== userId) throw { status: 403, message: 'Không có quyền xóa địa chỉ này' }
    await AddressModel.delete(id)
  },

  setDefault: async (userId, id) => {
    const address = await AddressModel.findById(id)
    if (!address) throw { status: 404, message: 'Địa chỉ không tồn tại' }
    if (address.user_id !== userId) throw { status: 403, message: 'Không có quyền' }
    await AddressModel.setDefault(userId, id)
    return await AddressModel.findById(id)
  }
}

module.exports = AddressService
