const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  deleted_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema, 'categories');

module.exports = Category;