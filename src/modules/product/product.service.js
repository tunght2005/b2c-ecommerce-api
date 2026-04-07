const Product = require('./product.model');
const Variant = require('../variant/variant.model');
const ProductImage = require('../product-image/product-image.model');
const fs = require('fs');
const path = require('path');
// slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// LIST
exports.list = async () => {
  return await Product.find()
    .populate('brand_id')
    .populate('category_id');
};

// DETAIL
exports.detail = async (id) => {
  return await Product.findById(id)
    .populate('brand_id')
    .populate('category_id');
};

// SEARCH
exports.search = async (keyword) => {
  return await Product.find({
    name: { $regex: keyword, $options: 'i' }
  });
};

// CREATE
exports.create = async (data) => {
  if (!data.name) {
    throw new Error('Name is required');
  }

  if (!data.slug) {
    data.slug = generateSlug(data.name);
  }

  return await Product.create(data);
};

// UPDATE
exports.update = async (id, data) => {
  if (data.name) {
    data.slug = generateSlug(data.name);
  }

  return await Product.findByIdAndUpdate(id, data, { new: true });
};



exports.remove = async (id) => {
  // 1. xoá variant
  await Variant.deleteMany({ product_id: id });

  // 2. lấy ảnh
  const images = await ProductImage.find({ product_id: id });

  // 3. xoá file
  for (const img of images) {
    const filePath = path.join(process.cwd(), img.url);

    console.log('Deleting:', filePath); // debug

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      console.log('File not found:', filePath);
    }
  }

  // 4. xoá DB image 
  await ProductImage.deleteMany({ product_id: id });

  // 5. xoá product
  return await Product.findByIdAndDelete(id);
};