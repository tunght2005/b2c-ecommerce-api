const ChatbotMessage = require('./chatbot.model')
const ChatbotConfig = require('./chatbotConfig.model')
const Product = require('../product/product.model')
const Variant = require('../variant/variant.model')

// Default Vietnamese stop words
const DEFAULT_STOP_WORDS = [
  'là',
  'có',
  'để',
  'và',
  've',
  'trong',
  'được',
  'cái',
  'chiếc',
  'tôi',
  'tôi muốn',
  'tôi cần',
  'tôi đang',
  'tôi yêu',
  'tôi thích',
  'bằng',
  'với',
  'của',
  'ở',
  'từ',
  'đến',
  'trên',
  'dưới',
  'ngoài',
  'bên',
  'hay',
  'mà',
  'nhưng',
  'hoặc',
  'không',
  'em',
  'anh',
  'chị',
  'ông',
  'bà',
  'ạ',
  'ơi',
  'nha',
  'nhé',
  'nào',
  'nay',
  'kia',
  'này',
  'đó',
  'kìa',
  'gì',
  'ai',
  'ích',
  'mua',
  'mớ',
  'cách',
  'cơ',
  'chứ',
  'thì',
  'bạn',
  'bác',
  'người',
  'ngôi',
  'tay',
  'tháng',
  'năm',
  'ngày',
  'giờ',
  'phút',
  'giây',
  'chỗ',
  'nơi',
  'vị',
  'trị',
  'hàng',
  'dùng',
  'giá',
  'tiền',
  'a',
  'an',
  'được',
  'sao',
  'vậy',
  'thế',
  'nào',
  'gì',
  'cái',
  'chiếc',
  'những'
]

/**
 * Lấy config từ database
 */
const getConfig = async () => {
  try {
    const config = await ChatbotConfig.findOne({ configType: 'stop_words', isActive: true })
    return config || { stopWords: DEFAULT_STOP_WORDS }
  } catch (error) {
    console.warn('Error loading config:', error)
    return { stopWords: DEFAULT_STOP_WORDS }
  }
}

/**
 * Trích xuất keywords từ thông điệp (cải thiện)
 * @param {string} message - Thông điệp từ người dùng
 * @param {array} stopWords - Danh sách stop words
 * @returns {array} - Mảng keywords
 */
exports.extractKeywords = (message, stopWords = DEFAULT_STOP_WORDS) => {
  let text = message.toLowerCase()
  text = text.replace(/[!?.,:;]/g, '')
  let words = text.split(/\s+/)

  const keywords = words.filter((word) => {
    return word.length > 2 && !stopWords.includes(word)
  })

  return [...new Set(keywords)]
}

/**
 * Tính relevance score cho sản phẩm
 * @param {object} product - Sản phẩm
 * @param {array} keywords - Keywords từ user
 * @param {object} rankingFactors - Ranking config
 * @returns {number} - Relevance score (0-1)
 */
const calculateRelevanceScore = (product, keywords, rankingFactors = {}) => {
  const { relevanceWeight = 0.6, stockWeight = 0.2, ratingWeight = 0.2 } = rankingFactors

  let relevanceScore = 0

  // 1. Tính keyword matching score
  const productText = `${product.name} ${product.description || ''}`.toLowerCase()
  let matchCount = 0

  keywords.forEach((keyword) => {
    if (productText.includes(keyword)) {
      matchCount++
    }
  })

  const keywordScore = keywords.length > 0 ? matchCount / keywords.length : 0

  // 2. Normalize stock score (0-1)
  const maxStock = 1000
  const stockScore = Math.min(product.availableVariant?.stock || 0, maxStock) / maxStock

  // 3. Rating score (nếu có)
  const ratingScore = (product.averageRating || 0) / 5

  // Calculate weighted score
  relevanceScore = keywordScore * relevanceWeight + stockScore * stockWeight + ratingScore * ratingWeight

  return relevanceScore
}

/**
 * Tìm kiếm sản phẩm theo keywords (cải thiện)
 * @param {array} keywords - Mảng keywords
 * @returns {array} - Mảng sản phẩm có sắp xếp theo relevance
 */
exports.searchProductsByKeywords = async (keywords) => {
  if (!keywords || keywords.length === 0) {
    return []
  }

  try {
    // Tìm sản phẩm bằng cách tìm từng keyword riêng rồi merge
    const searchPromises = keywords.map((keyword) => {
      return Product.find({
        $or: [{ name: { $regex: keyword, $options: 'i' } }, { description: { $regex: keyword, $options: 'i' } }],
        status: 'active'
      })
        .populate('brand_id')
        .populate('category_id')
        .lean()
    })

    const results = await Promise.all(searchPromises)

    // Flatten and deduplicate products by _id
    const productMap = new Map()
    results.forEach((productList) => {
      productList.forEach((product) => {
        if (!productMap.has(product._id.toString())) {
          productMap.set(product._id.toString(), product)
        }
      })
    })

    const products = Array.from(productMap.values())

    // Ranking - Sort by relevance score
    const rankedProducts = products
      .map((product) => ({
        ...product,
        relevanceScore: calculateRelevanceScore(product, keywords)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)

    return rankedProducts
  } catch (error) {
    console.error('Error searching products:', error)
    return []
  }
}

/**
 * Tạo phản hồi tự động (cải thiện)
 * @param {array} products - Mảng sản phẩm tìm được
 * @param {array} keywords - Mảy keywords
 * @returns {string} - Phản hồi chuỗi
 */
exports.generateResponse = (products, keywords) => {
  if (!products || products.length === 0) {
    const noProductResponses = [
      `Hiện tại cửa hàng chúng tôi không có sản phẩm mà bạn đang tìm (${keywords.join(', ')}). Bạn có muốn xem các sản phẩm khác không?`,
      `Xin lỗi, chúng tôi hiện không có "${keywords.join(', ')}" trong kho. Để biết thêm chi tiết, vui lòng liên hệ nhân viên bán hàng của chúng tôi.`,
      `Sản phẩm "${keywords.join(', ')}" bạn tìm hiện có thể đã hết hàng hoặc không có sẵn. Bạn có muốn tìm sản phẩm thay thế không?`,
      `Chúng tôi hiện không có sản phẩm với tìm kiếm "${keywords.join(', ')}". Vui lòng thử tìm kiếm từ khóa khác hoặc xem các danh mục sản phẩm của chúng tôi.`,
      `Thật tiếc, cửa hàng chúng tôi hiện không bán "${keywords.join(', ')}". Bạn có quan tâm đến sản phẩm tương tự không?`
    ]
    return noProductResponses[Math.floor(Math.random() * noProductResponses.length)]
  }

  const productCount = products.length
  const displayedCount = Math.min(productCount, 5)

  const formatProductInfo = (product, index) => {
    const price = product.availableVariant?.price
      ? `${product.availableVariant.price.toLocaleString('vi-VN')} VNĐ`
      : 'Liên hệ'
    const brand = product.brand_id?.name || 'N/A'
    const stock = product.availableVariant?.stock || 0
    const rating = product.averageRating ? `⭐ ${product.averageRating}/5` : '⭐ Chưa có đánh giá'

    return `${index}. 📦 ${product.name}\n   💰 Giá: ${price}\n   🏢 Thương hiệu: ${brand}\n   📊 Kho: ${stock} cái\n   ${rating}`
  }

  const productList = products
    .slice(0, 5)
    .map((p, i) => formatProductInfo(p, i + 1))
    .join('\n\n')

  let response = ''
  const headerMessages = [
    `✨ Hiện tại cửa hàng chúng tôi có các sản phẩm nổi bật như sau:`,
    `🎯 Chúng tôi tìm thấy ${productCount} sản phẩm phù hợp - dưới đây là những sản phẩm xuất sắc nhất:`,
    `👍 Tuyệt vời! Cửa hàng chúng tôi có ${productCount} sản phẩm liên quan:`,
    `🛍️ Hiện tại cửa hàng chúng tôi có các sản phẩm được bán chạy nhất:`
  ]

  response = headerMessages[Math.floor(Math.random() * headerMessages.length)]
  response += `\n\n${productList}`

  if (productCount > 5) {
    response += `\n\n📌 Ngoài ra, chúng tôi còn ${productCount - 5} sản phẩm khác. Bạn có muốn xem thêm không?`
  }

  response += `\n\n❓ Bạn muốn biết thêm chi tiết về sản phẩm nào không?`

  return response
}

/**
 * Xử lý thông điệp chatbot (cải thiện)
 * @param {string} userId - ID người dùng
 * @param {string} message - Thông điệp từ người dùng
 * @returns {object} - Kết quả xử lý
 */
exports.handleMessage = async (userId, message) => {
  try {
    // Load config
    const config = await getConfig()
    const stopWords = config.stopWords || DEFAULT_STOP_WORDS

    // 1. Extract keywords
    const keywords = this.extractKeywords(message, stopWords)

    // 2. Search products
    const products = await this.searchProductsByKeywords(keywords)

    // 3. Determine message type
    let messageType = 'other'
    if (
      message.toLowerCase().includes('xin chào') ||
      message.toLowerCase().includes('hello') ||
      message.toLowerCase().includes('hi') ||
      message.toLowerCase().includes('chào')
    ) {
      messageType = 'greeting'
    } else if (
      message.toLowerCase().includes('giúp') ||
      message.toLowerCase().includes('help') ||
      message.toLowerCase().includes('hướng dẫn') ||
      message.toLowerCase().includes('làm sao')
    ) {
      messageType = 'help'
    } else if (keywords.length > 0) {
      messageType = 'product_search'
    }

    // 4. Generate response
    let response
    switch (messageType) {
      case 'greeting':
        response = 'Xin chào! Chào mừng bạn đến với cửa hàng của chúng tôi. Bạn cần tìm sản phẩm nào hôm nay?'
        break
      case 'help':
        response =
          'Bạn có thể hỏi tôi về các sản phẩm bạn muốn mua. Ví dụ: "Tôi muốn mua laptop" hoặc "Bạn có điện thoại nào không?". Tôi sẽ giúp bạn tìm sản phẩm phù hợp!'
        break
      case 'product_search':
        response = this.generateResponse(products, keywords)
        break
      default:
        response = 'Xin lỗi, tôi không hiểu rõ yêu cầu của bạn. Bạn có thể mô tả sản phẩm bạn muốn tìm không?'
    }

    // 5. Save to database
    const chatMessage = await ChatbotMessage.create({
      user_id: userId,
      message,
      response,
      type: messageType,
      keywords,
      products_found: products.map((p) => p._id)
    })

    return {
      success: true,
      message: chatMessage,
      response,
      products: products.slice(0, 5).map((p) => ({
        id: p._id,
        name: p.name,
        description: p.description?.substring(0, 100),
        price: p.availableVariant?.price,
        brand: p.brand_id?.name,
        category: p.category_id?.name,
        stock: p.availableVariant?.stock,
        rating: p.averageRating || 0
      }))
    }
  } catch (error) {
    console.error('Error handling message:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

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
    .lean()
}

/**
 * Lấy analytics cho admin
 */
exports.getAnalytics = async (options = {}) => {
  const { startDate, endDate, limit = 20 } = options

  const query = {}
  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = startDate
    if (endDate) query.createdAt.$lte = endDate
  }

  // Top keywords
  const topKeywords = await ChatbotMessage.aggregate([
    { $match: query },
    { $unwind: '$keywords' },
    { $group: { _id: '$keywords', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ])

  // Message type distribution
  const messageTypeDistribution = await ChatbotMessage.aggregate([
    { $match: query },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ])

  // Total users
  const totalUsers = await ChatbotMessage.distinct('user_id', query)

  // Total messages
  const totalMessages = await ChatbotMessage.countDocuments(query)

  return {
    topKeywords,
    messageTypeDistribution,
    totalUsers: totalUsers.length,
    totalMessages
  }
}

/**
 * Lấy danh sách query không tìm thấy sản phẩm
 */
exports.getUnknownQueries = async (options = {}) => {
  const { limit = 20, page = 1 } = options

  const skip = (page - 1) * limit

  const unknownQueries = await ChatbotMessage.aggregate([
    { $match: { type: 'product_search', products_found: { $size: 0 } } },
    {
      $group: {
        _id: { message: '$message', keywords: '$keywords' },
        count: { $sum: 1 },
        lastSeen: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } },
    { $skip: skip },
    { $limit: limit }
  ])

  return unknownQueries
}
