const Brand = require('./brand.model');
const Product = require('../product/product.model');
exports.list = async () => {
  return await Brand.find();
};

exports.create = async ({ name, logo }) => {
  if (!name) {
    throw new Error('Name is required');
  }

  return await Brand.create({
    name,
    logo
  });
};

exports.update = async (id, { name, logo }) => {
  if (!name) throw new Error('Name is required');

  return await Brand.findByIdAndUpdate(
    id,
    {
      name,
      ...(logo && { logo }) // chỉ update logo nếu có
    },
    { new: true }
  );
};



// DELETE
exports.remove = async (id) => {
  // check brand tồn tại
  const brand = await Brand.findById(id);
  if (!brand) {
    throw new Error('Brand không tồn tại');
  }

  // check có product không
  const product = await Product.findOne({ brand_id: id });
  if (product) {
    throw new Error('Không thể xoá brand đang có product');
  }

  return await Brand.findByIdAndDelete(id);
};