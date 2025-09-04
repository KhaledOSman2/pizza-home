const express = require('express');
const { signup, login, logout, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.post('/signup', upload.single('avatar'), signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

module.exports = router;
