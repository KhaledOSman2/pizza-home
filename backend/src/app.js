const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
// const csrf = require('csurf'); // Disabled for development

const ApiError = require('./utils/ApiError');
const { errorHandler } = require('./middleware/errorHandler');
const { addDateHeaders } = require('./middleware/dateValidation');

// Route modules (will be created next)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const dishRoutes = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Trust proxy (useful when behind a proxy in production)
app.set('trust proxy', 1);

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:8080',
  'https://pizza-home-nvpx33k6f-khaledosman2s-projects.vercel.app',
  'https://pizza-home.vercel.app',
  'https://pizza-home-qapw5c9hb-khaledosman2s-projects.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];
app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  })
);

// Security headers
app.use(helmet());

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_secret_change_me'));

// Data sanitization against NoSQL query injection & XSS-ish payloads
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Compression
app.use(compression());

// Date validation and timezone headers
app.use(addDateHeaders);

// Rate limiting for API
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// CSRF protection using cookie-based tokens (disabled for development)
// const csrfProtection = csrf({
//   cookie: {
//     httpOnly: true,
//     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//     secure: process.env.NODE_ENV === 'production',
//   },
// });

// Apply CSRF only for state-changing methods to support token retrieval easily
// Disabled for development to simplify API integration
// app.use((req, res, next) => {
//   const method = req.method;
//   const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
//   // Skip CSRF if Bearer token is used (API-style) to allow flexibility
//   const hasBearer = (req.headers.authorization || '').startsWith('Bearer ');
//   if (isStateChanging && !hasBearer) {
//     return csrfProtection(req, res, next);
//   }
//   return next();
// });

// CSRF token endpoint (fetch token to use in X-CSRF-Token header)
// Disabled for development
// app.get('/api/auth/csrf-token', (req, res) => {
//   // Generate token if middleware attached (for GET, we attach temporarily)
//   csrfProtection(req, res, () => {
//     res.status(200).json({ csrfToken: req.csrfToken() });
//   });
// });

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    time: req.serverTime.toISOString(),
    timezone: 'Africa/Cairo'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler
app.all('*', (req, res, next) => {
  next(new ApiError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
