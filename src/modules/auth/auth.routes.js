const express = require('express')
const router = express.Router()
const AuthController = require('./auth.controller')
const authMiddleware = require('../../middlewares/auth.middleware')

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/refresh-token', AuthController.refreshToken)
router.post('/logout', authMiddleware, AuthController.logout)

module.exports = router
