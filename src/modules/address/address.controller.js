const AddressService = require('./address.service')

const AddressController = {
  getAll: async (req, res) => {
    try {
      const addresses = await AddressService.getAll(req.user.id)
      res.json({ addresses })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  },

  create: async (req, res) => {
    try {
      const address = await AddressService.create(req.user.id, req.body)
      res.status(201).json({ message: 'Thêm địa chỉ thành công', address })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
    }
  },

  update: async (req, res) => {
    try {
      const address = await AddressService.update(req.user.id, req.params.id, req.body)
      res.json({ message: 'Cập nhật địa chỉ thành công', address })
    } catch (err) {
      const status = typeof err.status === 'number' ? err.status : 500
      res.status(status).json({ message: err.message || 'Lỗi server' })
    }
  },

  delete: async (req, res) => {
    try {
      await AddressService.delete(req.user.id, req.params.id)
      res.json({ message: 'Xóa địa chỉ thành công' })
    } catch (err) {
      const status = typeof err.status === 'number' ? err.status : 500
      res.status(status).json({ message: err.message || 'Lỗi server' })
    }
  },

  setDefault: async (req, res) => {
    try {
      const address = await AddressService.setDefault(req.user.id, req.params.id)
      res.json({ message: 'Đặt địa chỉ mặc định thành công', address })
    } catch (err) {
      const status = typeof err.status === 'number' ? err.status : 500
      res.status(status).json({ message: err.message || 'Lỗi server' })
    }
  }
}

module.exports = AddressController
