/**
 * Date and timezone utilities for consistent timestamp handling
 */

/**
 * Get current date in Cairo timezone
 * @returns {Date} Current date in Cairo timezone
 */
const getCurrentCairoTime = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
};

/**
 * Get current date in server timezone (fallback to UTC)
 * @returns {Date} Current server time
 */
const getCurrentServerTime = () => {
  const now = new Date();
  
  // Log timezone info for debugging
  console.log('Server timezone info:', {
    serverTime: now.toISOString(),
    cairoTime: getCurrentCairoTime().toISOString(),
    timezone: process.env.TZ || 'UTC (default)',
    timezoneOffset: now.getTimezoneOffset()
  });
  
  return now;
};

/**
 * Ensure a date is not in the future (with 1 minute tolerance)
 * @param {Date|string} inputDate - The date to validate
 * @returns {Date} Validated date
 */
const validateAndCorrectDate = (inputDate) => {
  const date = new Date(inputDate);
  const now = getCurrentServerTime();
  const oneMinuteFromNow = new Date(now.getTime() + 60000); // 1 minute tolerance
  
  if (date > oneMinuteFromNow) {
    console.warn(`Future date detected and corrected: ${date.toISOString()} -> ${now.toISOString()}`);
    return now;
  }
  
  return date;
};

/**
 * Create a new order timestamp ensuring it's not in the future
 * @returns {Date} Valid order creation timestamp
 */
const createOrderTimestamp = () => {
  const now = getCurrentServerTime();
  
  // Additional validation: ensure we're not somehow getting a future date
  const validated = validateAndCorrectDate(now);
  
  return validated;
};

/**
 * Format date for consistent display across environments
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'ar-EG')
 * @returns {string} Formatted date string
 */
const formatOrderDate = (date, locale = 'ar-EG') => {
  const dateObj = new Date(date);
  
  return dateObj.toLocaleDateString(locale, {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

module.exports = {
  getCurrentCairoTime,
  getCurrentServerTime,
  validateAndCorrectDate,
  createOrderTimestamp,
  formatOrderDate
};
