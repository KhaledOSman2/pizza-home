/**
 * Middleware to override MongoDB timestamps with server-controlled time
 * This ensures consistent timestamps regardless of environment issues
 */

const mongoose = require('mongoose');

/**
 * Get Cairo time with proper timezone handling including daylight saving
 */
const getCairoTime = () => {
  // Use proper Cairo timezone with automatic DST handling
  const now = new Date();
  
  // Create date in Cairo timezone using toLocaleString
  const cairoTimeString = now.toLocaleString("en-CA", { 
    timeZone: "Africa/Cairo",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Parse the Cairo time string back to Date object
  const cairoTime = new Date(cairoTimeString.replace(', ', 'T'));
  
  return cairoTime;
};

/**
 * Override mongoose timestamps globally
 */
const setupTimestampOverride = () => {
  // Override the default timestamp function
  mongoose.Schema.prototype.add({
    createdAt: {
      type: Date,
      default: getCairoTime
    },
    updatedAt: {
      type: Date,
      default: getCairoTime
    }
  });
  
  // Hook into pre-save to ensure consistent timestamps
  mongoose.plugin(function(schema) {
    schema.pre('save', function() {
      const now = getCairoTime();
      
      if (this.isNew) {
        this.createdAt = now;
      }
      this.updatedAt = now;
      
      // Log for debugging
      console.log('Timestamp Override:', {
        isNew: this.isNew,
        model: this.constructor.modelName,
        createdAt: this.createdAt?.toISOString(),
        updatedAt: this.updatedAt?.toISOString(),
        serverTime: new Date().toISOString(),
        cairoTime: now.toISOString()
      });
    });
    
    schema.pre('findOneAndUpdate', function() {
      this.set({ updatedAt: getCairoTime() });
    });
    
    schema.pre('updateOne', function() {
      this.set({ updatedAt: getCairoTime() });
    });
    
    schema.pre('updateMany', function() {
      this.set({ updatedAt: getCairoTime() });
    });
  });
};

/**
 * Manual timestamp creation for explicit control
 * Simple and reliable approach
 */
const createTimestamp = () => {
  try {
    // Get current UTC time
    const now = new Date();
    
    // Egypt is currently UTC+2 (no DST since 2014)
    // Simply subtract 1 hour from the server time to get correct Cairo time
    const cairoTime = new Date(now.getTime() - (60 * 60 * 1000)); // Subtract 1 hour
    
    console.log('🕐 Simple Timestamp Control:', {
      serverUTC: now.toISOString(),
      correctedCairo: cairoTime.toISOString(),
      adjustment: '-1 hour',
      environment: process.env.NODE_ENV || 'development'
    });
    
    return cairoTime;
    
  } catch (error) {
    console.error('Timestamp creation error:', error);
    return new Date();
  }
};

/**
 * Validate and correct any suspicious timestamp
 */
const validateTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = getCairoTime();
  const maxFuture = new Date(now.getTime() + 5 * 60000); // 5 minutes tolerance
  
  if (date > maxFuture) {
    console.warn('Suspicious future timestamp corrected:', {
      original: date.toISOString(),
      corrected: now.toISOString(),
      environment: process.env.NODE_ENV
    });
    return now;
  }
  
  return date;
};

module.exports = {
  setupTimestampOverride,
  createTimestamp,
  validateTimestamp,
  getCairoTime
};
