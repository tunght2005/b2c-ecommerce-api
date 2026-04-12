const express = require('express');
const router = express.Router();
const controller = require('./promotion.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');


router.post('/', auth, role('admin'), controller.create);
router.post('/assign', auth, role('admin'), controller.assign);
router.post('/remove', auth, role('admin'), controller.remove);

router.get('/', controller.list); 
router.put('/:id', auth, role('admin'), controller.update); 
router.delete('/:id', auth, role('admin'), controller.deleteOne);

// lấy promotion tốt nhất của product
router.get('/best/:product_id', controller.getBest);

module.exports = router;