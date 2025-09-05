#!/usr/bin/env node

/**
 * Script to test timezone functionality locally before deployment
 */

// Set timezone like in production
process.env.TZ = 'Africa/Cairo';

const { 
  getCurrentServerTime, 
  getCurrentCairoTime, 
  createOrderTimestamp,
  validateAndCorrectDate,
  formatOrderDate 
} = require('./src/utils/dateHelpers');

console.log('🕐 Timezone Test Results');
console.log('========================');

const now = new Date();
const serverTime = getCurrentServerTime();
const cairoTime = getCurrentCairoTime();
const orderTimestamp = createOrderTimestamp();

console.log('\n📊 Server Information:');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Timezone:', process.env.TZ || 'UTC (system default)');
console.log('Platform:', process.platform);
console.log('Node Version:', process.version);

console.log('\n⏰ Timestamps:');
console.log('System Time (new Date()):', now.toISOString());
console.log('Server Time:', serverTime.toISOString());
console.log('Cairo Time:', cairoTime.toISOString());
console.log('Order Timestamp:', orderTimestamp.toISOString());

console.log('\n📅 Formatted Dates:');
console.log('Arabic Format:', formatOrderDate(orderTimestamp));
console.log('English Format:', formatOrderDate(orderTimestamp, 'en-US'));

console.log('\n🔍 Timezone Offsets:');
console.log('Server Offset (minutes):', serverTime.getTimezoneOffset());
console.log('Cairo Offset (minutes):', cairoTime.getTimezoneOffset());

console.log('\n✅ Future Date Validation:');
const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours in future
const correctedDate = validateAndCorrectDate(futureDate);
console.log('Future Date:', futureDate.toISOString());
console.log('Corrected Date:', correctedDate.toISOString());
console.log('Was Corrected:', futureDate.getTime() !== correctedDate.getTime());

console.log('\n🎯 Expected Results in Production:');
console.log('- All timestamps should use Africa/Cairo timezone');
console.log('- Future dates should be corrected to current time');
console.log('- Order creation should use consistent timestamps');

console.log('\n🚀 Ready for deployment!');
