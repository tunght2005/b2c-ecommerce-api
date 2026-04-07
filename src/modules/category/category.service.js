const Category = require('./category.model');
const mongoose = require('mongoose');

const buildTree = (categories, parentId = null) => {
  return categories
    .filter(c => String(c.parent_id) === String(parentId))
    .map(c => ({
      ...c._doc,
      children: buildTree(categories, c._id)
    }));
};

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// check slug trùng
const uniqueSlug = async (slug) => {
  let newSlug = slug;
  let count = 1;

  while (await Category.findOne({ slug: newSlug })) {
    newSlug = `${slug}-${count++}`;
  }

  return newSlug;
};

exports.create = async (data) => {
  if (!data.name) throw new Error('Name is required');

  let slug = data.slug || generateSlug(data.name);
  slug = await uniqueSlug(slug);

  const category = await Category.create({
    name: data.name,
    parent_id: data.parent_id || null,
    slug
  });

  return category;
};

exports.list = async () => {
  const categories = await Category.find({
    deleted_at: null
  });

  return buildTree(categories);
};

exports.update = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID');
  }

  let updateData = {};

  if (data.name) {
    updateData.name = data.name;
    updateData.slug = await uniqueSlug(generateSlug(data.name));
  }

  if (data.parent_id !== undefined) {
    updateData.parent_id = data.parent_id || null;
  }

  const category = await Category.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  return category;
};

exports.hasChildren = async (id) => {
  const count = await Category.countDocuments({
    parent_id: id,
    deleted_at: null
  });

  return count > 0;
};

exports.remove = async (id) => {
  return await Category.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    slug: `deleted-${Date.now()}`
  });
};

const Product = require('../product/product.model');

exports.hasProducts = async (categoryId) => {
  const count = await Product.countDocuments({
    category_id: categoryId,
    deleted_at: null // nếu có soft delete
  });

  return count > 0;
};