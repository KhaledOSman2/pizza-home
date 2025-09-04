const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const { processImageUpload, deleteFromCloudinary } = require('../utils/imageUpload');

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  avatar: u.avatar,
  phone: u.phone,
  address: u.address,
  isBlocked: u.isBlocked || false,
  blockReason: u.blockReason,
  blockedAt: u.blockedAt,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({ user: publicUser(req.user) });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { name, phone, address } = req.body;
  if (typeof name === 'string') user.name = name;
  if (typeof phone === 'string') user.phone = phone;
  if (typeof address === 'string') user.address = address;
  
  if (req.file) {
    // Delete old avatar if exists
    if (user.avatar && user.avatar.publicId) {
      try {
        await deleteFromCloudinary(user.avatar.publicId);
      } catch (error) {
        console.warn('Failed to delete old avatar:', error);
      }
    }
    
    // Upload new avatar
    try {
      user.avatar = await processImageUpload(req.file, 'pizza-home/avatars');
    } catch (error) {
      return next(new ApiError('Failed to upload avatar', 500));
    }
  }
  
  await user.save();
  res.status(200).json({ user: publicUser(user) });
});

// Admin only functions
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ results: users.length, users: users.map(publicUser) });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError('User not found', 404));
  res.status(200).json({ user: publicUser(user) });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError('User not found', 404));
  
  // Prevent admin from blocking themselves
  if (req.body.isBlocked === true && req.user.id === user.id) {
    return next(new ApiError('لا يمكنك حظر حسابك الخاص', 400));
  }
  
  const { name, email, phone, address, role, isBlocked, blockReason } = req.body;
  if (typeof name === 'string') user.name = name;
  if (typeof email === 'string') user.email = email;
  if (typeof phone === 'string') user.phone = phone;
  if (typeof address === 'string') user.address = address;
  if (typeof role === 'string' && ['customer', 'admin'].includes(role)) user.role = role;
  
  // Handle blocking/unblocking
  if (typeof isBlocked === 'boolean') {
    user.isBlocked = isBlocked;
    if (isBlocked) {
      user.blockReason = blockReason || '';
      user.blockedAt = new Date();
      user.blockedBy = req.user.id;
    } else {
      // When unblocking, clear block reason and timestamp
      user.blockReason = undefined;
      user.blockedAt = undefined;
      user.blockedBy = undefined;
    }
  }
  
  await user.save();
  res.status(200).json({ user: publicUser(user) });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError('User not found', 404));
  
  // Delete avatar from Cloudinary if exists
  if (user.avatar && user.avatar.publicId) {
    try {
      await deleteFromCloudinary(user.avatar.publicId);
    } catch (error) {
      console.warn('Failed to delete avatar from Cloudinary:', error);
    }
  }
  
  await User.findByIdAndDelete(req.params.id);
  res.status(204).json({ message: 'User deleted successfully' });
});

// Get user orders
exports.getUserOrders = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError('User not found', 404));
  
  const orders = await Order.find({ user: req.params.id })
    .populate('items.dish', 'name price image')
    .sort({ createdAt: -1 });
  
  res.status(200).json({ results: orders.length, orders });
});
