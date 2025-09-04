const express = require('express');
const { getMe, updateMe, getAllUsers, getUser, updateUser, deleteUser, getUserOrders } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// User routes
router.get('/me', protect, getMe);
router.patch('/me', protect, upload.single('avatar'), updateMe);

// Admin only routes
router.get('/', protect, restrictTo('admin'), getAllUsers);
router.get('/:id', protect, restrictTo('admin'), getUser);
router.get('/:id/orders', protect, restrictTo('admin'), getUserOrders);
router.patch('/:id', protect, restrictTo('admin'), updateUser);
router.delete('/:id', protect, restrictTo('admin'), deleteUser);

module.exports = router;
