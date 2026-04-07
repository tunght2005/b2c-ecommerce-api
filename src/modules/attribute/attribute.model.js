const mongoose = require('mongoose');

require('../attributeGroup/attributeGroup.model');

const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true },

  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttributeGroup',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Attribute', attributeSchema);