const chatbotService = require('./chatbot.service');

/**
 * POST /chatbot/message
 * Xử lý tin nhắn từ người dùng
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập tin nhắn'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Bạn cần đăng nhập để sử dụng chatbot'
      });
    }

    const result = await chatbotService.handleMessage(userId, message);

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.json({
      success: true,
      response: result.response,
      type: result.message?.type,
      keywords: result.message?.keywords,
      products_count: result.products?.length || 0,
      products: result.products,
      created_at: result.message?.createdAt
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi xử lý tin nhắn'
    });
  }
};

/**
 * GET /chatbot/history
 * Lấy lịch sử cuộc trò chuyện
 */
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Bạn cần đăng nhập để xem lịch sử'
      });
    }

    const history = await chatbotService.getChatHistory(userId, parseInt(limit));

    return res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error in getChatHistory:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi lấy lịch sử'
    });
  }
};

/**
 * POST /chatbot/search-products
 * Tìm sản phẩm dựa trên keyword (không cần đăng nhập)
 */
exports.searchProducts = async (req, res) => {
  try {
    const { keywords } = req.body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp keywords để tìm kiếm'
      });
    }

    const products = await chatbotService.searchProductsByKeywords(keywords);

    // Tạo phản hồi
    let response = '';
    if (products.length === 0) {
      const noProductResponses = [
        `Hiện tại cửa hàng chúng tôi không có sản phẩm mà bạn đang tìm (${keywords.join(', ')}).`,
        `Xin lỗi, chúng tôi hiện không có "${keywords.join(', ')}" trong kho.`,
        `Sản phẩm bạn tìm hiện có thể đã hết hàng hoặc không có sẵn.`
      ];
      response = noProductResponses[Math.floor(Math.random() * noProductResponses.length)];
    } else {
      const productList = products
        .slice(0, 5)
        .map((p, i) => `${i + 1}. ${p.name} - ${p.availableVariant?.price?.toLocaleString('vi-VN') || 'Liên hệ'} VNĐ (Kho: ${p.availableVariant?.stock})`)
        .join('\n');

      response = `✨ Hiện tại cửa hàng chúng tôi có ${products.length} sản phẩm nổi bật:\n${productList}`;
      
      if (products.length > 5) {
        response += `\n\nNgoài ra còn ${products.length - 5} sản phẩm khác.`;
      }
    }

    return res.json({
      success: true,
      keywords,
      products_count: products.length,
      response,
      data: products.slice(0, 5).map(p => ({
        id: p._id,
        name: p.name,
        description: p.description?.substring(0, 150),
        price: p.availableVariant?.price,
        brand: p.brand_id?.name,
        category: p.category_id?.name,
        stock: p.availableVariant?.stock
      }))
    });
  } catch (error) {
    console.error('Error in searchProducts:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi tìm kiếm sản phẩm'
    });
  }
};
