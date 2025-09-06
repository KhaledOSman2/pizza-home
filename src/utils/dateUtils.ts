/**
 * Date utility functions for consistent date handling in the frontend
 */

// Default timezone - can be configured based on location
const DEFAULT_TIMEZONE = 'Asia/Karachi'; // UTC+5 for Pakistan/Middle East
const CAIRO_TIMEZONE = 'Africa/Cairo';

/**
 * Format date for Arabic locale with Cairo timezone
 * @param date - Date to format
 * @returns Formatted date string in Arabic
 */
export const formatArabicDate = (date: Date | string, timezone: string = DEFAULT_TIMEZONE): string => {
  const dateObj = new Date(date);
  
  return dateObj.toLocaleString('ar-EG', {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format date in a compact format for tables
 * @param date - Date to format
 * @returns Compact formatted date string in Arabic
 */
export const formatCompactArabicDate = (date: Date | string, timezone: string = DEFAULT_TIMEZONE): string => {
  const dateObj = new Date(date);
  
  return dateObj.toLocaleString('ar-EG', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get relative time description in Arabic
 * @param date - Date to compare
 * @returns Relative time in Arabic
 */
export const getRelativeTimeArabic = (date: Date | string): string => {
  const now = new Date();
  const dateObj = new Date(date);
  
  // Use UTC timestamps for accurate comparison
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 0) {
    // Future date - this shouldn't happen but let's handle it gracefully
    return 'في المستقبل ⚠️';
  } else if (diffInSeconds < 60) {
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
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `منذ ${weeks} أسبوع`;
    } else {
      return formatCompactArabicDate(date);
    }
  }
};

/**
 * Check if a date might be in the future (allowing for reasonable time differences)
 * @param date - Date to check
 * @returns True if the date appears to be in the future
 */
export const isSuspiciousFutureDate = (date: Date | string): boolean => {
  const now = new Date();
  const dateObj = new Date(date);
  
  // Simple UTC comparison - both dates are in UTC
  // Allow up to 3 hours difference to handle various timezone issues
  const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  
  return dateObj > threeHoursFromNow;
};

/**
 * Format date for status history display
 * @param date - Date to format
 * @returns Formatted date with time emphasis
 */
export const formatStatusDate = (date: Date | string): string => {
  const dateObj = new Date(date);
  const isSuspicious = isSuspiciousFutureDate(date);
  
  const formatted = dateObj.toLocaleString('ar-EG', {
    timeZone: CAIRO_TIMEZONE,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  return isSuspicious ? `${formatted} ⚠️` : formatted;
};

/**
 * Sort orders by creation date (newest first) with proper date handling
 * @param orders - Array of orders to sort
 * @returns Sorted array of orders
 */
export const sortOrdersByDate = <T extends { createdAt: string }>(orders: T[]): T[] => {
  return [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    
    // Handle invalid dates
    if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
    if (isNaN(dateA.getTime())) return 1;
    if (isNaN(dateB.getTime())) return -1;
    
    // Sort newest first, but suspicious future dates go to bottom
    const aIsSuspicious = isSuspiciousFutureDate(dateA);
    const bIsSuspicious = isSuspiciousFutureDate(dateB);
    
    if (aIsSuspicious && !bIsSuspicious) return 1;
    if (!aIsSuspicious && bIsSuspicious) return -1;
    
    // Both are suspicious or both are normal - sort by date
    return dateB.getTime() - dateA.getTime();
  });
};

/**
 * Get a user-friendly warning message for suspicious dates
 * @param date - Date to check
 * @returns Warning message or null
 */
export const getDateWarningMessage = (date: Date | string): string | null => {
  if (isSuspiciousFutureDate(date)) {
    return 'هذا الطلب مسجل بتاريخ مستقبلي - قد يحتاج لمراجعة';
  }
  return null;
};
