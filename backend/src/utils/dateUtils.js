/**
 * Date utility functions for consistent date handling across the application
 */

// Set the default timezone to Cairo (Egypt) to ensure consistent date handling
const CAIRO_TIMEZONE = 'Africa/Cairo';

/**
 * Get current date/time - simplified to use system time
 * @returns {Date} Current system date/time
 */
const getCairoTime = () => {
  // Simplified: just return current system time
  // The timezone conversion will be handled in formatting functions
  return new Date();
};

/**
 * Create a new date ensuring it's not in the future
 * @param {Date|string} date - Optional date to validate
 * @returns {Date} Validated date (current time if future date provided)
 */
const createValidDate = (date = null) => {
  const now = new Date();
  
  if (!date) {
    return now;
  }
  
  const inputDate = new Date(date);
  
  // Allow for reasonable time differences (1 hour) to handle timezone issues
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  if (inputDate > oneHourFromNow) {
    console.warn(`⚠️ Future date detected (${inputDate.toISOString()}), using current time instead (current: ${now.toISOString()})`);
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
    const now = new Date(); // Use system time instead of converted time
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return false;
    }
    
    // Allow for up to 30 minutes difference to handle timezone issues between environments
    const allowedBuffer = new Date(now.getTime() + 30 * 60 * 1000);
    if (dateObj > allowedBuffer) {
      console.warn(`⚠️ Date ${dateObj.toISOString()} is more than 30 minutes in the future (current: ${now.toISOString()})`);
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
  const now = new Date();
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
