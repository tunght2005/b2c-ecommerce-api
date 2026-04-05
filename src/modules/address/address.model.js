const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver_name: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    detail: { type: String, required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    is_default: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const Address = mongoose.model('Address', addressSchema)

const AddressModel = {
  findAllByUserId: async (userId) => {
    return await Address.find({ user_id: userId }).sort({ is_default: -1 })
  },

  findById: async (id) => {
    return await Address.findById(id)
  },

  create: async ({ user_id, receiver_name, phone, province, district, ward, detail, latitude, longitude }) => {
    const address = new Address({
      user_id,
      receiver_name,
      phone,
      province,
      district,
      ward,
      detail,
      latitude,
      longitude
    })
    return await address.save()
  },

  update: async (id, data) => {
    return await Address.findByIdAndUpdate(id, data, { new: true })
  },

  delete: async (id) => {
    return await Address.findByIdAndDelete(id)
  },

  setDefault: async (userId, id) => {
    await Address.updateMany({ user_id: userId }, { is_default: false })
    await Address.findByIdAndUpdate(id, { is_default: true })
  }
}

module.exports = { AddressModel, Address }
