const Wishlist = require('./wishlist.model')

const wishlistService = {
  getMyWishlist: async (user_id) => {
    return await Wishlist.find({ user_id })
      .populate({
        path: 'product_id',
        select: 'name slug description brand_id category_id status',
        populate: [
          { path: 'brand_id', select: 'name' },
          { path: 'category_id', select: 'name' }
        ]
      })
      .lean()
  },

  addToWishlist: async (user_id, product_id) => {
    const existing = await Wishlist.findOne({ user_id, product_id })
    if (existing) {
      return existing
    }

    return await Wishlist.create({ user_id, product_id })
  },

  removeFromWishlist: async (user_id, product_id) => {
    const result = await Wishlist.findOneAndDelete({ user_id, product_id })

    if (!result) {
      throw new Error('Sản phẩm không tồn tại trong wishlist')
    }

    return { message: 'Đã xóa sản phẩm khỏi wishlist' }
  },

  clearWishlist: async (user_id) => {
    const result = await Wishlist.deleteMany({ user_id })

    return {
      message: 'Đã xóa toàn bộ wishlist',
      deletedCount: result.deletedCount || 0
    }
  }
}

module.exports = wishlistService
