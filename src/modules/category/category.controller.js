const CategoryService = require('./category.service');
const mongoose = require('mongoose');

exports.create = async (req, res) => {
  try {
    const data = await CategoryService.create(req.body);
    res.json({ message: 'Create category success', data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const data = await CategoryService.list();
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const data = await CategoryService.update(req.params.id, req.body);

    res.json({ message: 'Update success', data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    // check category con
    const hasChild = await CategoryService.hasChildren(id);
    if (hasChild) {
      return res.status(400).json({
        message: 'Không thể xóa: category có category con'
      });
    }

    //  check product
    const hasProduct = await CategoryService.hasProducts(id);
    if (hasProduct) {
      return res.status(400).json({
        message: 'Không thể xóa: category đang chứa sản phẩm'
      });
    }

    await CategoryService.remove(id);

    res.json({ message: 'Delete success (soft)' });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};