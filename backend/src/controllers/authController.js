const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { signAccessToken, setAuthCookie } = require('../utils/token');

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  avatar: u.avatar,
  phone: u.phone,
  address: u.address,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) return next(new ApiError('name, email and password are required', 400));

  const existing = await User.findOne({ email });
  if (existing) return next(new ApiError('Email already in use', 400));

  const avatar = req.file ? { url: req.file.path, publicId: req.file.filename || req.file.public_id } : undefined;
  const user = await User.create({ name, email, password, phone, address, avatar });
  const token = signAccessToken(user._id);
  setAuthCookie(res, token);
  res.status(201).json({ user: publicUser(user), token });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new ApiError('email and password are required', 400));
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new ApiError('Incorrect email or password', 401));
  }
  
  // Check if user is blocked
  if (user.isBlocked) {
    return next(new ApiError('تم حظر حسابك. يرجى الاتصال بالدعم للحصول على مزيد من المعلومات.', 403));
  }
  
  const token = signAccessToken(user._id);
  setAuthCookie(res, token);
  res.status(200).json({ user: publicUser(user), token });
});

exports.logout = catchAsync(async (_req, res) => {
  res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax' });
  res.status(200).json({ message: 'Logged out' });
});

exports.me = catchAsync(async (req, res) => {
  res.status(200).json({ user: publicUser(req.user) });
});
