const ReturnPolicy = require('./returnPolicy.model')
const ProductReturnPolicy = require('./productReturnPolicy.model')
const { ReturnRequest, RETURN_STATUS } = require('./returnRequest.model')
const { Warranty, WARRANTY_STATUS } = require('./warranty.model')
const Order = require('../order/order.model')

const resolveOrderItem = async (orderItemKey) => {
  if (!orderItemKey || typeof orderItemKey !== 'string') {
    throw new Error('order_item_id là bắt buộc')
  }

  const [orderId, itemIndexRaw] = orderItemKey.split(':')
  if (!orderId || itemIndexRaw === undefined) {
    throw new Error('order_item_id phải có định dạng <order_id>:<item_index>')
  }

  const itemIndex = Number(itemIndexRaw)
  if (!Number.isInteger(itemIndex) || itemIndex < 0) {
    throw new Error('item_index không hợp lệ trong order_item_id')
  }

  const order = await Order.findById(orderId)
  if (!order) {
    throw new Error('Không tìm thấy order tương ứng với order_item_id')
  }

  const item = order.items?.[itemIndex]
  if (!item) {
    throw new Error('Không tìm thấy order item tương ứng với order_item_id')
  }

  return { order, item }
}

const computeWarrantyEndDate = (startDate, warrantyPeriod) => {
  const date = new Date(startDate)
  date.setMonth(date.getMonth() + warrantyPeriod)
  return date
}

const afterSalesService = {
  // Return policies
  async createPolicy(payload) {
    const policy = await ReturnPolicy.create(payload)
    return policy
  },

  async listPolicies({ is_active } = {}) {
    const filter = {}
    if (typeof is_active === 'boolean') {
      filter.is_active = is_active
    }

    const policies = await ReturnPolicy.find(filter).sort({ created_at: -1 })
    return policies
  },

  async updatePolicy(id, payload) {
    const policy = await ReturnPolicy.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
    if (!policy) {
      throw new Error('Không tìm thấy return policy')
    }
    return policy
  },

  async deletePolicy(id) {
    const policy = await ReturnPolicy.findByIdAndDelete(id)
    if (!policy) {
      throw new Error('Không tìm thấy return policy')
    }
    await ProductReturnPolicy.deleteMany({ policy_id: id })
    return policy
  },

  async assignPolicyToProduct({ product_id, policy_id }) {
    const policy = await ReturnPolicy.findById(policy_id)
    if (!policy) {
      throw new Error('Return policy không tồn tại')
    }

    const link = await ProductReturnPolicy.findOneAndUpdate(
      { product_id, policy_id },
      { product_id, policy_id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
      .populate('product_id', 'name status')
      .populate('policy_id', 'name days_allowed is_active')

    return link
  },

  async listPolicyProductLinks() {
    return ProductReturnPolicy.find({})
      .populate('product_id', 'name status')
      .populate('policy_id', 'name days_allowed is_active')
      .sort({ created_at: -1 })
  },

  async listPoliciesByProduct(product_id) {
    return ProductReturnPolicy.find({ product_id })
      .populate('policy_id', 'name description days_allowed is_active')
      .sort({ created_at: -1 })
  },

  // Returns
  async createReturn(payload, requesterUserId) {
    const { order_item_id, policy_id, reason, refund_amount, evidence_image } = payload

    const policy = await ReturnPolicy.findById(policy_id)
    if (!policy || !policy.is_active) {
      throw new Error('Return policy không tồn tại hoặc đã ngưng áp dụng')
    }

    const { order } = await resolveOrderItem(order_item_id)

    if (order.status !== 'completed' || order.payment_status !== 'paid') {
      throw new Error('Chỉ cho phép tạo return cho đơn đã hoàn thành và đã thanh toán')
    }

    const daysSinceOrder = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceOrder > policy.days_allowed) {
      throw new Error(`Đơn đã quá hạn đổi trả (${policy.days_allowed} ngày)`)
    }

    const request = await ReturnRequest.create({
      order_item_id,
      policy_id,
      reason,
      refund_amount: refund_amount || 0,
      evidence_image: evidence_image || '',
      created_by: requesterUserId
    })

    return ReturnRequest.findById(request._id)
      .populate('policy_id', 'name days_allowed is_active')
      .populate('created_by', 'username email role')
  },

  async listReturns({ status, page = 1, limit = 10 }) {
    const filter = {}
    if (status && status !== 'all') {
      filter.status = status
    }

    const normalizedLimit = Math.max(1, Math.min(Number(limit) || 10, 100))
    const normalizedPage = Math.max(1, Number(page) || 1)
    const totalItems = await ReturnRequest.countDocuments(filter)
    const totalPages = Math.max(1, Math.ceil(totalItems / normalizedLimit))
    const safePage = Math.min(normalizedPage, totalPages)

    const returns = await ReturnRequest.find(filter)
      .populate('policy_id', 'name days_allowed is_active')
      .populate('created_by', 'username email role')
      .sort({ created_at: -1 })
      .skip((safePage - 1) * normalizedLimit)
      .limit(normalizedLimit)

    return {
      returns,
      pagination: {
        page: safePage,
        limit: normalizedLimit,
        totalItems,
        totalPages
      }
    }
  },

  async getReturnDetail(id) {
    const request = await ReturnRequest.findById(id)
      .populate('policy_id', 'name description days_allowed is_active')
      .populate('created_by', 'username email role')

    if (!request) {
      throw new Error('Không tìm thấy return request')
    }

    return request
  },

  async updateReturnStatus(id, status) {
    if (!RETURN_STATUS.includes(status)) {
      throw new Error(`status không hợp lệ. Chấp nhận: ${RETURN_STATUS.join(', ')}`)
    }

    const payload = {
      status,
      approved_at: status === 'APPROVED' ? new Date() : null
    }

    const request = await ReturnRequest.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      .populate('policy_id', 'name days_allowed is_active')
      .populate('created_by', 'username email role')

    if (!request) {
      throw new Error('Không tìm thấy return request')
    }

    return request
  },

  async listEligibleOrderItems({ search = '', page = 1, limit = 20 }) {
    const normalizedLimit = Math.max(1, Math.min(Number(limit) || 20, 100))
    const normalizedPage = Math.max(1, Number(page) || 1)

    const orderFilter = {
      status: 'completed',
      payment_status: 'paid'
    }

    const orders = await Order.find(orderFilter)
      .populate('user_id', 'username email')
      .populate({
        path: 'items.variant_id',
        model: 'Variant',
        select: 'sku product_id',
        populate: {
          path: 'product_id',
          model: 'Product',
          select: 'name status'
        }
      })
      .sort({ createdAt: -1 })

    const keyword = search.trim().toLowerCase()

    const flattened = orders.flatMap((order) =>
      (order.items || []).map((item, index) => {
        const variant = typeof item.variant_id === 'object' && item.variant_id ? item.variant_id : null
        const product = variant && typeof variant.product_id === 'object' ? variant.product_id : null

        return {
          order_item_id: `${order._id.toString()}:${index}`,
          order_id: order._id,
          created_at: order.createdAt,
          customer: order.user_id,
          quantity: item.quantity,
          price: item.price,
          variant,
          product
        }
      })
    )

    const filtered = keyword
      ? flattened.filter((entry) =>
          [
            entry.order_item_id,
            entry.order_id?.toString(),
            entry.variant?.sku || '',
            entry.product?.name || '',
            entry.customer?.username || '',
            entry.customer?.email || ''
          ]
            .join(' ')
            .toLowerCase()
            .includes(keyword)
        )
      : flattened

    const totalItems = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalItems / normalizedLimit))
    const safePage = Math.min(normalizedPage, totalPages)
    const items = filtered.slice((safePage - 1) * normalizedLimit, safePage * normalizedLimit)

    return {
      items,
      pagination: {
        page: safePage,
        limit: normalizedLimit,
        totalItems,
        totalPages
      }
    }
  },

  // Warranty
  async createWarranty(payload) {
    const { order_item_id, warranty_period, start_date, description_issue } = payload

    await resolveOrderItem(order_item_id)

    const startDate = start_date ? new Date(start_date) : new Date()
    const period = Number(warranty_period) || 12

    const record = await Warranty.create({
      order_item_id,
      warranty_period: period,
      start_date: startDate,
      end_date: computeWarrantyEndDate(startDate, period),
      description_issue: description_issue || ''
    })

    return record
  },

  async listWarranty({ status, page = 1, limit = 10 }) {
    const filter = {}
    if (status && status !== 'all') {
      filter.status = status
    }

    const normalizedLimit = Math.max(1, Math.min(Number(limit) || 10, 100))
    const normalizedPage = Math.max(1, Number(page) || 1)
    const totalItems = await Warranty.countDocuments(filter)
    const totalPages = Math.max(1, Math.ceil(totalItems / normalizedLimit))
    const safePage = Math.min(normalizedPage, totalPages)

    const records = await Warranty.find(filter)
      .sort({ created_at: -1 })
      .skip((safePage - 1) * normalizedLimit)
      .limit(normalizedLimit)

    return {
      records,
      pagination: {
        page: safePage,
        limit: normalizedLimit,
        totalItems,
        totalPages
      }
    }
  },

  async updateWarrantyStatus(id, status) {
    if (!WARRANTY_STATUS.includes(status)) {
      throw new Error(`status không hợp lệ. Chấp nhận: ${WARRANTY_STATUS.join(', ')}`)
    }

    const record = await Warranty.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
    if (!record) {
      throw new Error('Không tìm thấy warranty')
    }

    return record
  },

  async claimWarranty(id, description_issue) {
    const record = await Warranty.findById(id)
    if (!record) {
      throw new Error('Không tìm thấy warranty')
    }

    record.claim_count += 1
    record.status = 'CLAIMED'
    record.description_issue = description_issue || record.description_issue || ''

    await record.save()
    return record
  }
}

module.exports = afterSalesService
