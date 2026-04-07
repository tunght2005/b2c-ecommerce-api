const Service = require('./attributeGroup.service');

exports.list = async (req, res) => {
  res.json(await Service.list());
};

exports.create = async (req, res) => {
  res.json(await Service.create(req.body));
};

exports.update = async (req, res) => {
  res.json(await Service.update(req.params.id, req.body));
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;

    // check attribute
    const hasAttr = await Service.hasAttributes(id);

    if (hasAttr) {
      return res.status(400).json({
        message: 'Không thể xóa: attribute group còn attribute'
      });
    }

    await Service.remove(id);

    res.json({ message: 'Deleted' });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

