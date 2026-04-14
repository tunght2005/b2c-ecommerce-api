const mongoose = require('mongoose');

require('../user/user.model');

const chatbotMessageSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    response: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['product_search', 'greeting', 'help', 'other'],
      default: 'other'
    },
    products_found: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    keywords: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatbotMessage', chatbotMessageSchema);
