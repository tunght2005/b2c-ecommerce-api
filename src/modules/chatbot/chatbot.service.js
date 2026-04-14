const ChatbotMessage = require('./chatbot.model');
const Product = require('../product/product.model');
const Variant = require('../variant/variant.model');

// Danh sách từ dừng tiếng Việt phổ biến
const VIETNAMESE_STOP_WORDS = [
  'là', 'có', 'để', 'và', 've', 'trong', 'được', 'cái', 'chiếc', 'tôi', 'tôi muốn',
  'tôi cần', 'tôi đang', 'tôi yêu', 'tôi thích', 'bằng', 'cái', 'với', 'của', 'ở',
  'từ', 'đến', 'trên', 'dưới', 'ngoài', 'bên', 'hay', 'mà', 'nhưng', 'hoặc', 'không',
  'em', 'anh', 'chị', 'ông', 'bà', 'ạ', 'ơi', 'nha', 'nhé', 'nào', 'nay', 'kia',
  'này', 'đó', 'kìa', 'gì', 'ai', 'ích', 'mua', 'mớ', 'cách', 'cơ', 'chứ', 'thì',
  'bạn', 'bác', 'người', 'ngôi', 'tay', 'tháng', 'năm', 'ngày', 'giờ', 'phút',
  'giây', 'cách', 'chỗ', 'nơi', 'vị', 'trị', 'hàng', 'dùng', 'dùng', 'giá', 'tiền'
];

/**
 * Trích xuất keywords từ thông điệp
 * @param {string} message - Thông điệp từ người dùng
 * @returns {array} - Mảng keywords
 */
exports.extractKeywords = (message) => {
  // Chuyển thành chữ thường
  let text = message.toLowerCase();

  // Loại bỏ dấu câu
  text = text.replace(/[!?.,:;]/g, '');

  // Tách từ
  let words = text.split(/\s+/);

  // Lọc từ dừng và từ ngắn
  const keywords = words.filter(word => {
    return (
      word.length > 2 &&
      !VIETNAMESE_STOP_WORDS.includes(word)
    );
  });

  return [...new Set(keywords)]; // Loại bỏ duplicate
};

/**
 * Tìm kiếm sản phẩm theo keywords với điều kiện có hàng
 * @param {array} keywords - Mảng keywords
 * @returns {array} - Mảng sản phẩm có hàng
 */
exports.searchProductsByKeywords = async (keywords) => {
  if (!keywords || keywords.length === 0) {
    return [];
  }

  try {
    // Tạo regex pattern từ keywords
    const pattern = keywords.map(k => `(?=.*${k})`).join('');
    const regex = new RegExp(pattern, 'i');

    // Tìm sản phẩm có description hoặc name chứa keyword
    const products = await Product.find(
      {
        $or: [
          { description: regex },
          { name: regex },
          { description: { $regex: keywords.join('|'), $options: 'i' } },
          { name: { $regex: keywords.join('|'), $options: 'i' } }
        ],
        status: 'active'
      }
    )
      .populate('brand_id')
      .populate('category_id')
      .lean();

    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

/**
 * Danh sách phản hồi khi không tìm thấy sản phẩm
 * @param {array} keywords - Từ khóa tìm kiếm
 * @returns {string} - Phản hồi ngẫu nhiên
 */
const noProductResponses = (keywords) => {
  const keywordStr = keywords.join(', ');
  const responses = [
    `Hiện tại cửa hàng chúng tôi không có sản phẩm mà bạn đang tìm (${keywordStr}). Bạn có muốn xem các sản phẩm khác không?`,
    `Xin lỗi, chúng tôi hiện không có "${keywordStr}" trong kho. Để biết thêm chi tiết, vui lòng liên hệ nhân viên bán hàng của chúng tôi.`,
    `Sản phẩm "${keywordStr}" bạn tìm hiện có thể đã hết hàng hoặc không có sẵn. Bạn có muốn tìm sản phẩm thay thế không?`,
    `Chúng tôi hiện không có sản phẩm với tìm kiếm "${keywordStr}". Vui lòng thử tìm kiếm từ khóa khác hoặc xem các danh mục sản phẩm của chúng tôi.`,
    `Thật tiếc, cửa hàng chúng tôi hiện không bán "${keywordStr}". Bạn có quan tâm đến sản phẩm tương tự không?`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * Format thông tin sản phẩm chi tiết
 * @param {object} product - Thông tin sản phẩm
 * @param {number} index - Vị trí trong danh sách
 * @returns {string} - Thông tin sản phẩm định dạng
 */
const formatProductInfo = (product, index) => {
  const price = product.availableVariant?.price 
    ? `${product.availableVariant.price.toLocaleString('vi-VN')} VNĐ` 
    : 'Liên hệ';
  const brand = product.brand_id?.name || 'N/A';
  const stock = product.availableVariant?.stock || 0;
  
  return `${index}. 📦 ${product.name}\n   💰 Giá: ${price}\n   🏢 Thương hiệu: ${brand}\n   📊 Kho: ${stock} cái`;
};

/**
 * Tạo phản hồi tự động dựa trên tìm kiếm
 * @param {array} products - Mảng sản phẩm tìm được
 * @param {array} keywords - Mảy keywords
 * @returns {string} - Phản hồi chuỗi
 */
exports.generateResponse = (products, keywords) => {
  // Trường hợp không có sản phẩm
  if (!products || products.length === 0) {
    return noProductResponses(keywords);
  }

  // Trường hợp tìm thấy sản phẩm
  const productCount = products.length;
  const displayedCount = Math.min(productCount, 5);
  
  const productList = products
    .slice(0, 5)
    .map((p, i) => formatProductInfo(p, i + 1))
    .join('\n\n');

  // Tạo phản hồi tự động
  let response = '';
  const headerMessages = [
    `✨ Hiện tại cửa hàng chúng tôi có các sản phẩm nổi bật như sau:`,
    `🎯 Chúng tôi tìm thấy ${productCount} sản phẩm phù hợp - dưới đây là những sản phẩm xuất sắc nhất:`,
    `👍 Tuyệt vời! Cửa hàng chúng tôi có ${productCount} sản phẩm liên quan:`,
    `🛍️ Hiện tại cửa hàng chúng tôi có các sản phẩm được bán chạy nhất:`
  ];

  response = headerMessages[Math.floor(Math.random() * headerMessages.length)];
  response += `\n\n${productList}`;

  // Thêm thông báo nếu có nhiều hơn 5 sản phẩm
  if (productCount > 5) {
    response += `\n\n📌 Ngoài ra, chúng tôi còn ${productCount - 5} sản phẩm khác. Bạn có muốn xem thêm không?`;
  }

  response += `\n\n❓ Bạn muốn biết thêm chi tiết về sản phẩm nào không?`;

  return response;
};

/**
 * Xử lý thông điệp chatbot
 * @param {string} userId - ID người dùng
 * @param {string} message - Thông điệp từ người dùng
 * @returns {object} - Kết quả xử lý
 */
exports.handleMessage = async (userId, message) => {
  try {
    // 1. Trích xuất keywords
    const keywords = this.extractKeywords(message);

    // 2. Tìm kiếm sản phẩm
    const products = await this.searchProductsByKeywords(keywords);

    // 3. Tìm ra loại thông điệp
    let messageType = 'other';
    if (
      message.toLowerCase().includes('xin chào') ||
      message.toLowerCase().includes('hello') ||
      message.toLowerCase().includes('hi')
    ) {
      messageType = 'greeting';
    } else if (
      message.toLowerCase().includes('giúp') ||
      message.toLowerCase().includes('help') ||
      message.toLowerCase().includes('hướng dẫn')
    ) {
      messageType = 'help';
    } else if (keywords.length > 0) {
      messageType = 'product_search';
    }

    // 4. Tạo phản hồi
    let response;
    switch (messageType) {
      case 'greeting':
        response = 'Xin chào! Chào mừng bạn đến với cửa hàng của chúng tôi. Bạn cần tìm sản phẩm nào hôm nay?';
        break;
      case 'help':
        response = 'Bạn có thể hỏi tôi về các sản phẩm bạn muốn mua. Ví dụ: "Tôi muốn mua laptop" hoặc "Bạn có điện thoại nào không?". Tôi sẽ giúp bạn tìm sản phẩm phù hợp!';
        break;
      case 'product_search':
        response = this.generateResponse(products, keywords);
        break;
      default:
        response = 'Xin lỗi, tôi không hiểu rõ yêu cầu của bạn. Bạn có thể mô tả sản phẩm bạn muốn tìm không?';
    }

    // 5. Lưu tin nhắn vào database
    const chatMessage = await ChatbotMessage.create({
      user_id: userId,
      message,
      response,
      type: messageType,
      keywords,
      products_found: products.map(p => p._id)
    });

    return {
      success: true,
      message: chatMessage,
      response,
      products: products.slice(0, 5).map(p => ({
        id: p._id,
        name: p.name,
        description: p.description?.substring(0, 100),
        price: p.availableVariant?.price,
        brand: p.brand_id?.name,
        category: p.category_id?.name,
        stock: p.availableVariant?.stock
      }))
    };
  } catch (error) {
    console.error('Error handling message:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Lấy lịch sử cuộc trò chuyện
 * @param {string} userId - ID người dùng
 * @param {number} limit - Số tin nhắn tối đa
 * @returns {array} - Lịch sử tin nhắn
 */
exports.getChatHistory = async (userId, limit = 20) => {
  return await ChatbotMessage.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('products_found', 'name description')
    .lean();
};
