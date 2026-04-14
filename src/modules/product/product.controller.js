const ProductService = require('./product.service');

exports.list = async (req, res) => {
  const data = await ProductService.list();
  res.json(data);
};

exports.detail = async (req, res) => {
  const data = await ProductService.detail(req.params.id);
  res.json(data);
};

exports.search = async (req, res) => {
  const data = await ProductService.search(req.query.q);
  res.json(data);
};



exports.remove = async (req, res) => {
  await ProductService.remove(req.params.id);
  res.json({ message: 'Delete success' });
};

// CREATE
exports.create = async (req, res) => {
  try {
    const data = await ProductService.create(req.body);

    res.json({
      message: 'Create product success',
      data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    const data = await ProductService.update(id, req.body);

    res.json({
      message: 'Update success',
      data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

