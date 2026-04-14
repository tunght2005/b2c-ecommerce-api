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

router.use('/cart', require('./modules/cart/cart.routes'));
router.use('/order', require('./modules/order/order.routes'));
router.use('/payment', require('./modules/payment/payment.routes'));
router.use('/vouchers', require('./modules/voucher/voucher.routes'));
router.use('/shipment', require('./modules/shipment/shipment.routes'));
router.use('/feedback', require('./modules/feedback/feedback.routes'));
module.exports = router
