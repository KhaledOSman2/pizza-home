/**
 * Middleware to override MongoDB timestamps with server-controlled time
 * This ensures consistent timestamps regardless of environment issues
 */

const mongoose = require('mongoose');

/**
 * Get Cairo time with proper timezone handling
 */
const getCairoTime = () => {
  // Force Cairo timezone calculation
  const now = new Date();
  const cairoOffset = 2 * 60; // Cairo is UTC+2 (in minutes)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const cairoTime = new Date(utc + (cairoOffset * 60000));
  
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
 */
const createTimestamp = () => {
  return getCairoTime();
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
