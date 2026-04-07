const AttributeService = require('./attribute.service');

// CREATE
exports.create = async (req, res) => {
  try {
    const data = await AttributeService.create(req.body);
    res.json({ message: 'Create attribute success', data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// LIST
exports.list = async (req, res) => {
  const data = await AttributeService.list();
  res.json(data);
};

// GET BY GROUP
exports.getByGroup = async (req, res) => {
  const data = await AttributeService.getByGroup(req.params.groupId);
  res.json(data);
};

// UPDATE
exports.update = async (req, res) => {
  const data = await AttributeService.update(req.params.id, req.body);
  res.json({ message: 'Update success', data });
};

// DELETE
exports.remove = async (req, res) => {
  await AttributeService.remove(req.params.id);
  res.json({ message: 'Delete success' });
};