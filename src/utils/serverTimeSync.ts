/**
 * Utility for syncing client time with server time
 */

let serverTimeOffset = 0;
let lastSyncTime = 0;

/**
 * Sync with server time by fetching current server time
 */
export const syncWithServerTime = async (): Promise<void> => {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    
    if (data.time) {
      const serverTime = new Date(data.time);
      const clientTime = new Date();
      serverTimeOffset = serverTime.getTime() - clientTime.getTime();
      lastSyncTime = Date.now();
      
      console.log(`🕒 Server time sync: offset = ${serverTimeOffset}ms`);
    }
  } catch (error) {
    console.warn('Failed to sync with server time:', error);
  }
};

/**
 * Get current server time (with fallback to client time)
 */
export const getServerTime = (): Date => {
  // Re-sync if it's been more than 5 minutes
  if (Date.now() - lastSyncTime > 5 * 60 * 1000) {
    syncWithServerTime();
  }
  
  return new Date(Date.now() + serverTimeOffset);
};

/**
 * Convert a date to server timezone
 */
export const toServerTime = (date: Date): Date => {
  return new Date(date.getTime() + serverTimeOffset);
};

/**
 * Check if a date is suspicious using server time
 */
export const isSuspiciousDateWithServerSync = (date: Date | string): boolean => {
  const dateObj = new Date(date);
  const serverNow = getServerTime();
  
  // Allow 30 minutes buffer
  const buffer = 30 * 60 * 1000;
  return dateObj.getTime() > (serverNow.getTime() + buffer);
};

// Auto-sync on module load
syncWithServerTime();
