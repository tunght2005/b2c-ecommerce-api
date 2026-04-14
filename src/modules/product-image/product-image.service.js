const ProductImage = require('./product-image.model');

// create nhiều ảnh
exports.createMany = async (data) => {
  return await ProductImage.insertMany(data);
};

// get theo product
exports.getByProduct = async (product_id) => {
  return await ProductImage.find({ product_id })
    .sort({ sort_order: 1 });
};

// delete
const fs = require('fs');
const path = require('path');

exports.remove = async (id) => {
  const image = await ProductImage.findById(id);

  if (image) {
    const filePath = path.join(__dirname, '../../..', image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  return await ProductImage.findByIdAndDelete(id);
};