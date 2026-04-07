const BrandService = require('./brand.service');

exports.list = async (req, res) => {
  const data = await BrandService.list();
  res.json(data);
};


exports.create = async (req, res) => {
  try {
    const logo = req.file ? req.file.path.replace(/\\/g, '/')
    : null;

    const data = await BrandService.create({
      name: req.body.name,
      logo
    });

    res.json({
      message: 'Create brand success',
      data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const logo = req.file
      ? req.file.path.replace(/\\/g, '/')
      : null;

    const data = await BrandService.update(req.params.id, {
      name: req.body.name,
      logo
    });

    res.json({
      message: 'Update brand success',
      data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// DELETE
exports.remove = async (req, res) => {
  try {
    await BrandService.remove(req.params.id);
    res.json({ message: 'Delete brand success' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};