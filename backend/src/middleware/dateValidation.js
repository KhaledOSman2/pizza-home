/**
 * Middleware for date validation to prevent future dates in orders
 */

const { isValidOrderDate, createValidDate } = require('../utils/dateUtils');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to validate order dates before saving
 */
const validateOrderDates = (req, res, next) => {
  try {
    // If there's a timestamp in the request body, validate it
    if (req.body.timestamp) {
      if (!isValidOrderDate(req.body.timestamp)) {
        return next(new ApiError('Invalid timestamp: future dates are not allowed', 400));
      }
    }
    
    // If there are status history items with timestamps, validate them
    if (req.body.statusHistory && Array.isArray(req.body.statusHistory)) {
      for (const historyItem of req.body.statusHistory) {
        if (historyItem.timestamp && !isValidOrderDate(historyItem.timestamp)) {
          return next(new ApiError('Invalid status history timestamp: future dates are not allowed', 400));
        }
      }
    }
    
    next();
  } catch (error) {
    return next(new ApiError('Date validation error', 400));
  }
};

/**
 * Middleware to sanitize and fix dates in request body
 */
const sanitizeDates = (req, res, next) => {
  try {
    // Fix any timestamps in the request body
    if (req.body.timestamp) {
      req.body.timestamp = createValidDate(req.body.timestamp);
    }
    
    // Fix timestamps in status history
    if (req.body.statusHistory && Array.isArray(req.body.statusHistory)) {
      req.body.statusHistory = req.body.statusHistory.map(item => ({
        ...item,
        timestamp: item.timestamp ? createValidDate(item.timestamp) : createValidDate()
      }));
    }
    
    next();
  } catch (error) {
    return next(new ApiError('Date sanitization error', 400));
  }
};

/**
 * Express middleware to add date validation headers and current time info
 */
const addDateHeaders = (req, res, next) => {
  const cairoTime = createValidDate();
  
  // Add server time information to response headers
  res.set({
    'X-Server-Time': cairoTime.toISOString(),
    'X-Server-Timezone': 'Asia/Kuwait'
  });
  
  // Add current time to request for use in controllers
  req.serverTime = cairoTime;
  
  next();
};

module.exports = {
  validateOrderDates,
  sanitizeDates,
  addDateHeaders
};
