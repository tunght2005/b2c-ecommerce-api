const Model = require('./attributeGroup.model');
const Variant = require('../variant/variant.model');
const Attribute = require('../attribute/attribute.model');
exports.list = () => Model.find();

exports.create = (data) => Model.create(data);

exports.update = (id, data) =>
  Model.findByIdAndUpdate(id, data, { new: true });

exports.remove = (id) =>
  Model.findByIdAndDelete(id);

exports.hasAttributes = async (groupId) => {
  const count = await Attribute.countDocuments({
    group_id: groupId
  });

  return count > 0;
};


exports.isUsedInVariant = async (groupId) => {
  const attributes = await Attribute.find({ group_id: groupId }).select('_id');

  const attrIds = attributes.map(a => a._id);

  const count = await Variant.countDocuments({
    attributes: { $in: attrIds }
  });

  return count > 0;
};