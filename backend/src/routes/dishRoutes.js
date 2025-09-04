const express = require('express');
const { list, getOne, create, update, remove } = require('../controllers/dishController');
const { protect, restrictTo } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.get('/', list);
router.get('/:id', getOne);
router.post('/', protect, restrictTo('admin'), upload.single('image'), create);
router.patch('/:id', protect, restrictTo('admin'), upload.single('image'), update);
router.delete('/:id', protect, restrictTo('admin'), remove);

module.exports = router;
