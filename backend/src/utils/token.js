const jwt = require('jsonwebtoken');

function signAccessToken(userId) {
  const secret = process.env.JWT_ACCESS_SECRET;
  const expiresIn = process.env.JWT_ACCESS_EXPIRES || '1d';
  if (!secret) throw new Error('JWT_ACCESS_SECRET not configured');
  return jwt.sign({ id: userId }, secret, { expiresIn });
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    signed: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
}

module.exports = { signAccessToken, setAuthCookie };
