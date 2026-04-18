const voucherService = require('./voucher.service')

const voucherController = {
  // 1. [MỚI] API dành cho Admin: Tạo mã Voucher mới
  createVoucher: async (req, res) => {
    try {
      // Gọi xuống service để tạo voucher
      const newVoucher = await voucherService.createVoucher(req.body)

      return res.status(201).json({
        success: true,
        message: 'Tạo mã giảm giá thành công!',
        data: newVoucher
      })
    } catch (error) {
      // Bắt lỗi (ví dụ: thiếu trường bắt buộc, trùng mã code...)
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  listVouchers: async (req, res) => {
    try {
      const data = await voucherService.listVouchers(req.query)
      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách voucher thành công',
        data
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  updateVoucher: async (req, res) => {
    try {
      const data = await voucherService.updateVoucher(req.params.id, req.body)
      return res.status(200).json({
        success: true,
        message: 'Cập nhật voucher thành công',
        data
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  deleteVoucher: async (req, res) => {
    try {
      const data = await voucherService.deleteVoucher(req.params.id)
      return res.status(200).json({
        success: true,
        message: 'Xóa voucher thành công',
        data
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // 2. API dành cho User: Áp dụng mã giảm giá (Giữ nguyên)
  applyVoucher: async (req, res) => {
    try {
      const { code, cart_total } = req.body

      if (!code || !cart_total) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp mã giảm giá (code) và tổng tiền (cart_total).'
        })
      }

      const result = await voucherService.calculateDiscount(code, cart_total)

      return res.status(200).json({
        success: true,
        message: 'Áp dụng mã giảm giá thành công!',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }
}

module.exports = voucherController
