/**
 * Date utility functions for consistent date handling across the application
 */

// Set the default timezone to Cairo (Egypt) to ensure consistent date handling
const CAIRO_TIMEZONE = 'Africa/Cairo';

/**
 * Get current date/time in Cairo timezone
 * @returns {Date} Current date in Cairo timezone
 */
const getCairoTime = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: CAIRO_TIMEZONE }));
};

/**
 * Create a new date ensuring it's not in the future
 * @param {Date|string} date - Optional date to validate
 * @returns {Date} Validated date (current time if future date provided)
 */
const createValidDate = (date = null) => {
  const now = getCairoTime();
  
  if (!date) {
    return now;
  }
  
  const inputDate = new Date(date);
  
  // If the provided date is in the future, use current time instead
  if (inputDate > now) {
    console.warn(`⚠️ Future date detected (${inputDate.toISOString()}), using current time instead`);
    return now;
  }
  
  return inputDate;
};

/**
 * Format date for Arabic locale
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
const formatArabicDate = (date) => {
  const dateObj = new Date(date);
  
  return dateObj.toLocaleString('ar-EG', {
    timeZone: CAIRO_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format date for API response (ISO string)
 * @param {Date|string} date - Date to format
 * @returns {string} ISO date string
 */
const formatApiDate = (date) => {
  return new Date(date).toISOString();
};

/**
 * Check if a date is valid and not in the future
 * @param {Date|string} date - Date to validate
 * @returns {boolean} True if date is valid and not future
 */
const isValidOrderDate = (date) => {
  try {
    const dateObj = new Date(date);
    const now = getCairoTime();
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return false;
    }
    
    // Check if date is not more than 5 minutes in the future (allowing for small clock differences)
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    if (dateObj > fiveMinutesFromNow) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get relative time description in Arabic
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time in Arabic
 */
const getRelativeTimeArabic = (date) => {
  const now = getCairoTime();
  const dateObj = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'الآن';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `منذ ${minutes} دقيقة`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `منذ ${hours} ساعة`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) {
      return 'أمس';
    } else if (days < 7) {
      return `منذ ${days} أيام`;
    } else {
      return formatArabicDate(date);
    }
  }
};

module.exports = {
  getCairoTime,
  createValidDate,
  formatArabicDate,
  formatApiDate,
  isValidOrderDate,
  getRelativeTimeArabic,
  CAIRO_TIMEZONE
};
