#!/usr/bin/env node

// Load environment variables
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '.env') });

process.env.TZ = 'Africa/Cairo';

const { createTimestamp, getCairoTime } = require('./src/middleware/timestampOverride');

console.log('🧪 New Timestamp Control Test');
console.log('==============================');

const controlled = createTimestamp();
const system = new Date();
const cairo = getCairoTime();

console.log('Controlled timestamp:', controlled.toISOString());
console.log('System timestamp:    ', system.toISOString());
console.log('Cairo time:         ', cairo.toISOString());

console.log('\nTime differences:');
console.log('Controlled vs System:', Math.round((controlled.getTime() - system.getTime()) / 1000), 'seconds');
console.log('Cairo vs System:     ', Math.round((cairo.getTime() - system.getTime()) / 1000), 'seconds');

console.log('\nFormatted times:');
console.log('Controlled:', controlled.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' }));
console.log('System:    ', system.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' }));
console.log('Cairo:     ', cairo.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' }));

console.log('\n✅ Test completed!');
