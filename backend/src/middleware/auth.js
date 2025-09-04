const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const getTokenFromRequest = (req) => {
  const bearer = req.headers.authorization;
  if (bearer && bearer.startsWith('Bearer ')) return bearer.split(' ')[1];
  if (req.signedCookies && req.signedCookies.access_token) return req.signedCookies.access_token;
  if (req.cookies && req.cookies.access_token) return req.cookies.access_token;
  return null;
};

exports.protect = catchAsync(async (req, _res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return next(new ApiError('You are not logged in', 401));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    return next(new ApiError('Invalid or expired token', 401));
  }

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next(new ApiError('The user belonging to this token no longer exists', 401));
  
  // Check if user is blocked
  if (currentUser.isBlocked) {
    return next(new ApiError('تم حظر حسابك. يرجى الاتصال بالدعم للحصول على مزيد من المعلومات.', 403));
  }

  req.user = currentUser;
  next();
});

exports.optionalAuth = catchAsync(async (req, _res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (currentUser) req.user = currentUser;
  } catch (_) {
    // ignore
  }
  next();
});

exports.restrictTo = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new ApiError('Not authenticated', 401));
  if (!roles.includes(req.user.role)) return next(new ApiError('You do not have permission to perform this action', 403));
  next();
};
