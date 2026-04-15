const express = require('express')
const router = express.Router()
const AdminUserController = require('./adminUser.controller')
const authMiddleware = require('../../middlewares/auth.middleware')
const requireRole = require('../../middlewares/role.middleware')

router.use(authMiddleware, requireRole('admin'))

router.get('/', AdminUserController.list)
router.get('/:id', AdminUserController.detail)
router.post('/', AdminUserController.create)
router.put('/:id', AdminUserController.update)
router.delete('/:id', AdminUserController.remove)

module.exports = router
