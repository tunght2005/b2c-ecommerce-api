const express = require('express')
const router = express.Router()

router.use('/auth', require('./modules/auth/auth.routes'))
router.use('/user', require('./modules/user/user.routes'))
router.use('/address', require('./modules/address/address.routes'))
router.use('/notification', require('./modules/notification/notification.routes'))

router.use('/products', require('./modules/product/product.routes'));
router.use('/variants', require('./modules/variant/variant.routes'));
router.use('/categories', require('./modules/category/category.routes'));
router.use('/brands', require('./modules/brand/brand.routes'));
router.use('/attribute-groups', require('./modules/attributeGroup/attributeGroup.routes'));
router.use('/attributes', require('./modules/attribute/attribute.routes'));
router.use('/product-images', require('./modules/product-image/product-image.routes'));



module.exports = router
