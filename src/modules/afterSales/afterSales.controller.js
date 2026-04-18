const afterSalesService = require('./afterSales.service')

const parseBoolean = (value) => {
  if (value === undefined) return undefined
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

const afterSalesController = {
  // Return policies
  async createPolicy(req, res) {
    try {
      const policy = await afterSalesService.createPolicy(req.body)
      res.status(201).json({ success: true, data: policy })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  async listPolicies(req, res) {
    try {
      const policies = await afterSalesService.listPolicies({
        is_active: parseBoolean(req.query.is_active)
      })
      res.status(200).json({ success: true, data: policies })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async updatePolicy(req, res) {
    try {
      const policy = await afterSalesService.updatePolicy(req.params.id, req.body)
      res.status(200).json({ success: true, data: policy })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  async deletePolicy(req, res) {
    try {
      const policy = await afterSalesService.deletePolicy(req.params.id)
      res.status(200).json({ success: true, data: policy })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  async assignPolicyToProduct(req, res) {
    try {
      const link = await afterSalesService.assignPolicyToProduct(req.body)
      res.status(201).json({ success: true, data: link })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  async listPolicyProductLinks(req, res) {
    try {
      const links = await afterSalesService.listPolicyProductLinks()
      res.status(200).json({ success: true, data: links })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async listPoliciesByProduct(req, res) {
    try {
      const links = await afterSalesService.listPoliciesByProduct(req.params.productId)
      res.status(200).json({ success: true, data: links })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // Returns
  async createReturn(req, res) {
    try {
      const request = await afterSalesService.createReturn(req.body, req.user.id)
      res.status(201).json({ success: true, data: request })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  async listReturns(req, res) {
    try {
      const result = await afterSalesService.listReturns({
        status: req.query.status,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        role: req.user.role,
        requesterUserId: req.user.id
      })
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async getReturnDetail(req, res) {
    try {
      const request = await afterSalesService.getReturnDetail(req.params.id, {
        role: req.user.role,
        requesterUserId: req.user.id
      })
      res.status(200).json({ success: true, data: request })
    } catch (error) {
      res.status(404).json({ success: false, message: error.message })
    }
  },

  async updateReturnStatus(req, res) {
    try {
      const request = await afterSalesService.updateReturnStatus(req.params.id, req.body.status)
      res.status(200).json({ success: true, data: request })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  async listEligibleOrderItems(req, res) {
    try {
      const result = await afterSalesService.listEligibleOrderItems({
        search: req.query.search || '',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        role: req.user.role,
        requesterUserId: req.user.id
      })
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  // Warranty
  async createWarranty(req, res) {
    try {
      const warranty = await afterSalesService.createWarranty(req.body, {
        role: req.user.role,
        requesterUserId: req.user.id
      })
      res.status(201).json({ success: true, data: warranty })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  async listWarranty(req, res) {
    try {
      const result = await afterSalesService.listWarranty({
        status: req.query.status,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        role: req.user.role,
        requesterUserId: req.user.id
      })
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  async updateWarrantyStatus(req, res) {
    try {
      const warranty = await afterSalesService.updateWarrantyStatus(req.params.id, req.body.status)
      res.status(200).json({ success: true, data: warranty })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  async claimWarranty(req, res) {
    try {
      const warranty = await afterSalesService.claimWarranty(req.params.id, req.body.description_issue, {
        role: req.user.role,
        requesterUserId: req.user.id
      })
      res.status(200).json({ success: true, data: warranty })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  }
}

module.exports = afterSalesController
