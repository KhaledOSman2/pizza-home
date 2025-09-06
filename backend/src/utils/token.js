const jwt = require('jsonwebtoken');

function signAccessToken(userId) {
  const secret = process.env.JWT_ACCESS_SECRET;
  const expiresIn = process.env.JWT_ACCESS_EXPIRES || '1d';
  if (!secret) throw new Error('JWT_ACCESS_SECRET not configured');
  return jwt.sign({ id: userId }, secret, { expiresIn });
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  
  // In production, use more permissive cookie settings for cross-domain
  const cookieOptions = {
    httpOnly: true,
    secure: isProd, // HTTPS only in production
    sameSite: isProd ? 'none' : 'lax', // Allow cross-site cookies in production
    signed: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };
  
  // Add domain setting for production if needed
  if (isProd && process.env.COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN;
  }
  
  res.cookie('access_token', token, cookieOptions);
}

module.exports = { signAccessToken, setAuthCookie };
