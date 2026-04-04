const express = require('express')
const router = express.Router()
const AddressController = require('./address.controller')
const authMiddleware = require('../../middlewares/auth.middleware')
const requireRole = require('../../middlewares/role.middleware')

// Tất cả route cần auth + role customer
router.use(authMiddleware)
router.use(requireRole('customer'))

router.get('/', AddressController.getAll)
router.post('/', AddressController.create)
router.put('/:id', AddressController.update)
router.delete('/:id', AddressController.delete)
router.patch('/:id/default', AddressController.setDefault)

module.exports = router
