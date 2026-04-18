const PromotionService = require('./promotion.service')

// tạo promotion
exports.create = async (req, res) => {
  try {
    const data = await PromotionService.create(req.body)
    res.json({ message: 'Create promotion success', data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// gán promotion cho product
exports.assign = async (req, res) => {
  try {
    const { promotion_id, product_ids } = req.body

    const data = await PromotionService.assignToProduct(promotion_id, product_ids)

    res.json({ message: 'Assign success', data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// remove
exports.remove = async (req, res) => {
  try {
    const { promotion_id, product_id } = req.body

    const data = await PromotionService.removeFromProduct(promotion_id, product_id)

    res.json({ message: 'Remove success', data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.listAssignments = async (req, res) => {
  try {
    const data = await PromotionService.listAssignments(req.query)
    res.json({ message: 'Success', data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// list
exports.list = async (req, res) => {
  try {
    const data = await PromotionService.getAll(req.query)
    res.json({ message: 'Success', data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// update
exports.update = async (req, res) => {
  try {
    const { id } = req.params

    const data = await PromotionService.update(id, req.body)

    res.json({ message: 'Update success', data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// delete 1 promotion
exports.deleteOne = async (req, res) => {
  try {
    const { id } = req.params

    const data = await PromotionService.deleteOne(id)

    res.json({ message: 'Delete success', data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// lấy best promotion
exports.getBest = async (req, res) => {
  try {
    const { product_id } = req.params

    const data = await PromotionService.getBestPromotionByVariant(product_id)

    res.json({ message: 'Success', data })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
