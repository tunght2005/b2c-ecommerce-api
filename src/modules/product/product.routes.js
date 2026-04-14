const router = require('express').Router();
const controller = require('./product.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

router.get('/', controller.list);
router.get('/search', controller.search);
router.get('/:id', controller.detail);

router.post('/', auth, role('admin'), controller.create);
router.put('/:id', auth, role('admin'), controller.update);
router.delete('/:id', auth, role('admin'), controller.remove);

module.exports = router;