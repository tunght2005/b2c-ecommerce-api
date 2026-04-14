const express = require('express')
const router = express.Router()
const UserController = require('./user.controller')
const authMiddleware = require('../../middlewares/auth.middleware')

// Tất cả route user đều cần auth
router.use(authMiddleware)

router.get('/profile', UserController.getProfile)
router.put('/profile', UserController.updateProfile)
router.put('/change-password', UserController.changePassword)

module.exports = router
