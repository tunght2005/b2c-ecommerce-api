const express = require('express')
const router = express.Router()

const wishlistController = require('./wishlist.controller')
const authMiddleware = require('../../middlewares/auth.middleware')
const requireRole = require('../../middlewares/role.middleware')

router.get('/', authMiddleware, requireRole('customer'), wishlistController.getMyWishlist)
router.post('/', authMiddleware, requireRole('customer'), wishlistController.addToWishlist)
router.delete('/product/:productId', authMiddleware, requireRole('customer'), wishlistController.removeFromWishlist)
router.delete('/', authMiddleware, requireRole('customer'), wishlistController.clearWishlist)

module.exports = router
