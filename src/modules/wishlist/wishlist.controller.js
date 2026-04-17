const mongoose = require('mongoose')
const wishlistService = require('./wishlist.service')

const wishlistController = {
  getMyWishlist: async (req, res) => {
    try {
      const user_id = req.user.id
      const wishlist = await wishlistService.getMyWishlist(user_id)

      return res.status(200).json({
        success: true,
        count: wishlist.length,
        data: wishlist
      })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  },

  addToWishlist: async (req, res) => {
    try {
      const user_id = req.user.id
      const { product_id } = req.body

      if (!product_id || !mongoose.Types.ObjectId.isValid(product_id)) {
        return res.status(400).json({ success: false, message: 'product_id không hợp lệ' })
      }

      const result = await wishlistService.addToWishlist(user_id, product_id)

      return res.status(201).json({
        success: true,
        message: 'Đã thêm sản phẩm vào wishlist',
        data: result
      })
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  },

  removeFromWishlist: async (req, res) => {
    try {
      const user_id = req.user.id
      const { productId } = req.params

      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'productId không hợp lệ' })
      }

      const result = await wishlistService.removeFromWishlist(user_id, productId)

      return res.status(200).json({ success: true, message: result.message })
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  },

  clearWishlist: async (req, res) => {
    try {
      const user_id = req.user.id
      const result = await wishlistService.clearWishlist(user_id)

      return res.status(200).json({ success: true, data: result })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }
}

module.exports = wishlistController
