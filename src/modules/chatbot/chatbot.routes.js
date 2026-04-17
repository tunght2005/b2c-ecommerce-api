const express = require('express')
const router = express.Router()
const chatbotController = require('./chatbot.controller')
const authMiddleware = require('../../middlewares/auth.middleware')
const roleMiddleware = require('../../middlewares/role.middleware')

/**
 * USER ROUTES
 */

/**
 * POST /chatbot/message
 * Gửi tin nhắn cho chatbot (yêu cầu đăng nhập)
 */
router.post('/message', authMiddleware, chatbotController.sendMessage)

/**
 * GET /chatbot/history
 * Lấy lịch sử cuộc trò chuyện (yêu cầu đăng nhập)
 */
router.get('/history', authMiddleware, chatbotController.getChatHistory)

/**
 * POST /chatbot/search-products
 * Tìm sản phẩm theo keywords (không cần đăng nhập)
 */
router.post('/search-products', chatbotController.searchProducts)

/**
 * ADMIN ROUTES
 */

/**
 * GET /chatbot/admin/config
 * Lấy cấu hình chatbot
 */
router.get('/admin/config', authMiddleware, roleMiddleware(['admin']), chatbotController.getConfig)

/**
 * POST /chatbot/admin/config/stop-words
 * Cập nhật stop words
 */
router.post('/admin/config/stop-words', authMiddleware, roleMiddleware(['admin']), chatbotController.updateStopWords)

/**
 * GET /chatbot/admin/analytics
 * Lấy analytics
 */
router.get('/admin/analytics', authMiddleware, roleMiddleware(['admin', 'support']), chatbotController.getAnalytics)

/**
 * GET /chatbot/admin/unknown-queries
 * Lấy danh sách query không tìm thấy sản phẩm
 */
router.get(
  '/admin/unknown-queries',
  authMiddleware,
  roleMiddleware(['admin', 'support']),
  chatbotController.getUnknownQueries
)

module.exports = router
