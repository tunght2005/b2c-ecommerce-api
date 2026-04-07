const Attribute = require('./attribute.model');

exports.create = async (data) => {
  if (!data.name || !data.group_id) {
    throw new Error('Name và group_id là bắt buộc');
  }

  return await Attribute.create(data);
};

exports.list = async () => {
  return await Attribute.find().populate('group_id');
};

exports.getByGroup = async (groupId) => {
  return await Attribute.find({ group_id: groupId });
};

exports.update = async (id, data) => {
  return await Attribute.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await Attribute.findByIdAndDelete(id);
};