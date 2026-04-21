const paymentService = require('./payment.service')
const Order = require('../order/order.model')
const Payment = require('./payment.model')
const qs = require('qs')
const crypto = require('crypto')

const paymentController = {
  // API TẠO LINK THANH TOÁN
  createVNPAYPayment: async (req, res) => {
    try {
      const { order_id } = req.body

      const order = await Order.findById(order_id)
      if (!order) return res.status(404).json({ message: 'Không thấy đơn hàng' })

      const newPayment = new Payment({
        order_id: order._id,
        amount: order.final_price,
        method: 'VNPAY'
      })
      await newPayment.save()

      const url = paymentService.createVNPAYUrl(req, order._id.toString(), order.final_price)
      res.status(200).json({ success: true, url })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  // API XỬ LÝ KHI VNPAY TRẢ KẾT QUẢ VỀ
  vnpayReturn: async (req, res) => {
    try {
      let vnp_Params = req.query
      const secureHash = vnp_Params['vnp_SecureHash']

      // Xóa hash cũ để tính toán lại
      delete vnp_Params['vnp_SecureHash']
      delete vnp_Params['vnp_SecureHashType']

      // Tạo lại chữ ký
      const secretKey = process.env.VNP_HASH_SECRET
      const sortedParams = sortObject(vnp_Params)
      const signData = qs.stringify(sortedParams, { encode: false })
      const hmac = crypto.createHmac('sha512', secretKey)
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

      // So sánh chữ ký
      if (secureHash === signed) {
        const orderId = vnp_Params['vnp_TxnRef']
        const responseCode = vnp_Params['vnp_ResponseCode']

        if (responseCode === '00') {
          await Payment.findOneAndUpdate(
            { order_id: orderId },
            {
              status: 'success',
              vnp_TransactionNo: vnp_Params['vnp_TransactionNo']
            }
          )
          await Order.findByIdAndUpdate(orderId, {
            payment_status: 'paid', // Đã thanh toán
            status: 'confirmed' // Chuyển sang 'Đang xử lý' hoặc 'confirmed' tùy bạn đặt
          })

          return res.redirect(buildOrdersRedirectUrl('success', orderId))
        } else {
          // THANH TOÁN THẤT BẠI
          await Payment.findOneAndUpdate({ order_id: orderId }, { status: 'failed' })
          return res.redirect(buildOrdersRedirectUrl('failed', orderId))
        }
      } else {
        return res.redirect(buildOrdersRedirectUrl('invalid_signature', null))
      }
    } catch (error) {
      console.error('Lỗi xử lý vnpayReturn:', error)
      return res.redirect(buildOrdersRedirectUrl('error', null))
    }
  }
}

function buildOrdersRedirectUrl(paymentStatus, orderId) {
  const frontendBaseUrl = process.env.FRONTEND_WEB_URL || 'http://localhost:5173'
  const ordersPath = process.env.FRONTEND_ORDERS_PATH || '/orders'
  const normalizedBase = frontendBaseUrl.endsWith('/') ? frontendBaseUrl.slice(0, -1) : frontendBaseUrl
  const normalizedPath = ordersPath.startsWith('/') ? ordersPath : `/${ordersPath}`
  const query = new URLSearchParams({ paymentStatus })

  if (orderId) {
    query.set('orderId', String(orderId))
  }

  return `${normalizedBase}${normalizedPath}?${query.toString()}`
}

// HÀM SẮP XẾP CHUẨN (Đã fix triệt để lỗi hasOwnProperty)
function sortObject(obj) {
  let sorted = {}
  let str = []
  let key
  for (key in obj) {
    // Mượn hàm Object.prototype an toàn
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key))
    }
  }
  str.sort()
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
  }
  return sorted
}

module.exports = paymentController
