const express = require('express');
const router = express.Router();
const chatbotController = require('./chatbot.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

/**
 * POST /chatbot/message
 * Gửi tin nhắn cho chatbot (yêu cầu đăng nhập)
 */
router.post('/message', authMiddleware, chatbotController.sendMessage);

/**
 * GET /chatbot/history
 * Lấy lịch sử cuộc trò chuyện (yêu cầu đăng nhập)
 */
router.get('/history', authMiddleware, chatbotController.getChatHistory);

/**
 * POST /chatbot/search-products
 * Tìm sản phẩm theo keywords (không cần đăng nhập)
 */
router.post('/search-products', chatbotController.searchProducts);

module.exports = router;
