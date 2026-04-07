const ProductImageService = require('./product-image.service');

exports.upload = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      throw new Error('Không có file');
    }

    const product_id = req.body.product_id;

    const data = files.map((file, index) => ({
      product_id,
      url: `/uploads/${file.filename}`,
      is_primary: index === 0, // ảnh đầu làm ảnh chính
      sort_order: index
    }));

    const result = await ProductImageService.createMany(data);

    res.json({
      message: 'Upload success',
      data: result
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// lấy ảnh theo product
exports.getByProduct = async (req, res) => {
  try {
    const data = await ProductImageService.getByProduct(req.params.product_id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// xoá ảnh
exports.remove = async (req, res) => {
  try {
    await ProductImageService.remove(req.params.id);
    res.json({ message: 'Delete image success' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};