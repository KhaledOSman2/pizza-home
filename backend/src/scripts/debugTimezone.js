/**
 * Debug script to test timezone handling
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { getCairoTime, createValidDate, isValidOrderDate, formatArabicDate } = require('../utils/dateUtils');

// Load environment variables
dotenv.config({ path: require('path').join(__dirname, '..', '..', '.env') });

const debugTimezone = () => {
  console.log('🕒 Timezone Debug Information');
  console.log('═'.repeat(60));
  
  // System information
  const systemTime = new Date();
  console.log(`🖥️  System Time: ${systemTime.toISOString()}`);
  console.log(`🌍  System Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  console.log(`🕰️  System Local String: ${systemTime.toLocaleString()}`);
  
  console.log('\n📍 Cairo Time Calculations:');
  console.log('─'.repeat(40));
  
  const cairoTime = getCairoTime();
  console.log(`🕌  getCairoTime(): ${cairoTime.toISOString()}`);
  console.log(`📅  Formatted Arabic: ${formatArabicDate(cairoTime)}`);
  
  // Test various timezones
  console.log('\n🌐 Different Timezone Formats:');
  console.log('─'.repeat(40));
  
  const testDate = new Date();
  console.log(`UTC:     ${testDate.toLocaleString('en-US', { timeZone: 'UTC' })}`);
  console.log(`Cairo:   ${testDate.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}`);
  console.log(`NY:      ${testDate.toLocaleString('en-US', { timeZone: 'America/New_York' })}`);
  console.log(`London:  ${testDate.toLocaleString('en-GB', { timeZone: 'Europe/London' })}`);
  
  // Test date validation
  console.log('\n✅ Date Validation Tests:');
  console.log('─'.repeat(40));
  
  const testDates = [
    new Date(), // now
    new Date(Date.now() + 10 * 60 * 1000), // 10 minutes future
    new Date(Date.now() + 30 * 60 * 1000), // 30 minutes future  
    new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours future
    new Date(Date.now() - 10 * 60 * 1000), // 10 minutes past
  ];
  
  testDates.forEach((date, index) => {
    const isValid = isValidOrderDate(date);
    const diffMinutes = Math.round((date.getTime() - Date.now()) / (1000 * 60));
    console.log(`Test ${index + 1}: ${date.toISOString()} (${diffMinutes > 0 ? '+' : ''}${diffMinutes}min) → ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  });
  
  // Test createValidDate
  console.log('\n🛠️  CreateValidDate Tests:');
  console.log('─'.repeat(40));
  
  const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours future
  const validatedDate = createValidDate(futureDate);
  console.log(`Input (future):  ${futureDate.toISOString()}`);
  console.log(`Output (fixed):  ${validatedDate.toISOString()}`);
  console.log(`Was corrected:   ${futureDate.getTime() !== validatedDate.getTime() ? 'Yes' : 'No'}`);
  
  console.log('\n🔍 Environment Variables:');
  console.log('─'.repeat(40));
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`TZ: ${process.env.TZ || 'not set'}`);
  
  console.log('\n🎯 Recommendations:');
  console.log('─'.repeat(40));
  console.log('• If you see issues, check server timezone settings');
  console.log('• Make sure both development and production use consistent time sources');
  console.log('• Consider setting TZ environment variable in production');
  console.log('• Monitor for timezone-related warnings in logs');
  
  process.exit(0);
};

debugTimezone();
