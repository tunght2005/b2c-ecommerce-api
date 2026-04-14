const VariantService = require('./variant.service');

// CREATE
exports.create = async (req, res) => {
  try {
    const data = await VariantService.create(req.body);
    res.json({ message: 'Create variant success', data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET BY PRODUCT
exports.getByProduct = async (req, res) => {
  const data = await VariantService.getByProduct(req.params.productId);
  res.json(data);
};

// FILTER
exports.filter = async (req, res) => {
  try {
    const ids = req.query.attributes?.split(',') || [];

    const data = await VariantService.filter(ids);

    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  const data = await VariantService.update(req.params.id, req.body);
  res.json({ message: 'Update success', data });
};

// DELETE
exports.remove = async (req, res) => {
  await VariantService.remove(req.params.id);
  res.json({ message: 'Delete success' });
};