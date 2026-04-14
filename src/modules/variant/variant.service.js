const Variant = require('./variant.model');

// CREATE
exports.create = async (data) => {
  if (!data.product_id || !data.sku) {
    throw new Error('product_id và sku là bắt buộc');
  }

  return await Variant.create(data);
};

// GET BY PRODUCT
exports.getByProduct = async (productId) => {
  return await Variant.find({ product_id: productId })
    .populate('attributes');
};

// FILTER
exports.filter = async (attributeIds) => {
  return await Variant.find({
    attributes: { $all: attributeIds }
  })
    .populate('attributes')
    .populate('product_id');
};

// UPDATE
exports.update = async (id, data) => {
  return await Variant.findByIdAndUpdate(id, data, { new: true });
};

// DELETE
exports.remove = async (id) => {
  return await Variant.findByIdAndDelete(id);
};