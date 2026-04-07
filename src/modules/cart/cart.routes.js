const express = require('express');
const router = express.Router();
const cartController = require('./cart.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
// Đừng quên import middleware check auth của bạn ở đây để lấy req.user.id
// const authMiddleware = require('../../middlewares/auth'); 
// router.use(authMiddleware);

router.get('/',authMiddleware,requireRole('customer'), cartController.getCart);
router.post('/add', authMiddleware,requireRole('customer'),cartController.addToCart);
router.delete('/remove', authMiddleware,requireRole('customer'),cartController.removeFromCart);

module.exports = router;