#!/usr/bin/env node

// Load environment variables
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '.env') });

const { createTimestamp } = require('./src/middleware/timestampOverride');

console.log('🕐 DST Fix Test');
console.log('================');

const now = new Date();
const cairo = createTimestamp();

console.log('System Time: ', now.toISOString());
console.log('Cairo Time:  ', cairo.toISOString());
console.log('Difference:  ', Math.round((cairo.getTime() - now.getTime()) / (1000 * 60)), 'minutes');

console.log('\nFormatted:');
console.log('System: ', now.toLocaleString('ar-EG'));
console.log('Cairo:  ', cairo.toLocaleString('ar-EG'));

console.log('\nCurrent Month:', now.getMonth(), '(0-based)');
console.log('Should be DST?', now.getMonth() >= 3 && now.getMonth() <= 9 ? 'Yes (UTC+3)' : 'No (UTC+2)');

console.log('\n✅ Test completed!');
