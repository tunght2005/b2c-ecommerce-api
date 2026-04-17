const mongoose = require('mongoose')

// Schema lưu cấu hình chatbot (stop words, response templates, etc.)
const chatbotConfigSchema = new mongoose.Schema(
  {
    configType: {
      type: String,
      enum: ['stop_words', 'response_template', 'category_keywords'],
      required: true
    },
    // Stop words storage
    stopWords: [String], // ['là', 'có', 'để', ...]

    // Response template storage
    responseTemplates: {
      greeting: [String],
      help: [String],
      noProduct: [String],
      foundProducts: [String],
      productNotFound: [String]
    },

    // Category keyword mapping
    categoryKeywords: [
      {
        category_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category'
        },
        keywords: [String],
        priority: {
          type: Number,
          default: 0
        }
      }
    ],

    // AI settings
    settings: {
      minKeywordLength: {
        type: Number,
        default: 2
      },
      maxProductResults: {
        type: Number,
        default: 5
      },
      confidenceThreshold: {
        type: Number,
        default: 0.5
      },
      rankingFactors: {
        relevanceWeight: { type: Number, default: 0.6 },
        stockWeight: { type: Number, default: 0.2 },
        ratingWeight: { type: Number, default: 0.2 }
      }
    },

    isActive: {
      type: Boolean,
      default: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('ChatbotConfig', chatbotConfigSchema)
