const express = require('express');
const { create, list, getOne, updateStatus } = require('../controllers/orderController');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', optionalAuth, create);
router.get('/', protect, list);
router.get('/:id', protect, getOne);
router.patch('/:id/status', protect, restrictTo('admin'), updateStatus);

module.exports = router;
