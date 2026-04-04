const express = require('express')
const router = express.Router()

router.use('/auth', require('./modules/auth/auth.routes'))
router.use('/user', require('./modules/user/user.routes'))
router.use('/address', require('./modules/address/address.routes'))
router.use('/notification', require('./modules/notification/notification.routes'))

module.exports = router
