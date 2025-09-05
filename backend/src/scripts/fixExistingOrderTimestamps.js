#!/usr/bin/env node

/**
 * Script to fix existing orders with incorrect timestamps
 */

// Load environment variables
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');
const Order = require('../models/Order');
const connectDB = require('../config/db');

// Set timezone
process.env.TZ = process.env.TZ || 'Africa/Cairo';

const fixExistingOrderTimestamps = async () => {
  try {
    await connectDB();
    console.log('🔍 Analyzing existing orders...');
    
    // Get all orders
    const orders = await Order.find({}).sort({ createdAt: -1 });
    console.log(`📊 Found ${orders.length} orders in database`);
    
    const now = new Date();
    const suspiciousOrders = [];
    const validOrders = [];
    
    // Analyze each order
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const diffInMinutes = (orderDate.getTime() - now.getTime()) / (1000 * 60);
      
      if (diffInMinutes > 5) {
        suspiciousOrders.push({
          id: order._id,
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
          diffInMinutes: Math.round(diffInMinutes),
          customer: order.customer.name
        });
      } else {
        validOrders.push(order);
      }
    });
    
    console.log(`\n📈 Analysis Results:`);
    console.log(`✅ Valid orders: ${validOrders.length}`);
    console.log(`⚠️  Suspicious orders (future dates): ${suspiciousOrders.length}`);
    
    if (suspiciousOrders.length > 0) {
      console.log('\n🔍 Suspicious Orders Details:');
      suspiciousOrders.forEach((order, index) => {
        console.log(`${index + 1}. Order #${order.orderNumber || order.id.toString().slice(-6)}`);
        console.log(`   Customer: ${order.customer}`);
        console.log(`   Created: ${order.createdAt.toISOString()}`);
        console.log(`   Minutes in future: ${order.diffInMinutes}`);
        console.log('');
      });
      
      console.log('🛠️  Would you like to fix these orders? (This will update their timestamps)');
      console.log('   Run with --fix flag to actually perform the fix');
      
      // Check if --fix flag is provided
      if (process.argv.includes('--fix')) {
        console.log('\n🔧 Fixing suspicious orders...');
        
        for (const suspiciousOrder of suspiciousOrders) {
          // Calculate a reasonable timestamp (e.g., subtract the excess time)
          const originalDate = new Date(suspiciousOrder.createdAt);
          const correctedDate = new Date(now.getTime() - (suspiciousOrders.indexOf(suspiciousOrder) * 60000)); // Spread orders 1 minute apart
          
          await Order.findByIdAndUpdate(suspiciousOrder.id, {
            createdAt: correctedDate,
            updatedAt: now
          });
          
          console.log(`✅ Fixed order #${suspiciousOrder.orderNumber}: ${originalDate.toISOString()} → ${correctedDate.toISOString()}`);
        }
        
        console.log(`\n🎉 Successfully fixed ${suspiciousOrders.length} orders!`);
      } else {
        console.log('\n💡 To fix these orders, run:');
        console.log('   node src/scripts/fixExistingOrderTimestamps.js --fix');
      }
    } else {
      console.log('\n🎉 All orders have valid timestamps!');
    }
    
    console.log('\n📋 Summary:');
    console.log(`- Total orders: ${orders.length}`);
    console.log(`- Valid orders: ${validOrders.length}`);
    console.log(`- Fixed orders: ${suspiciousOrders.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing order timestamps:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Script interrupted by user');
  process.exit(0);
});

console.log('🕐 Order Timestamp Fixer');
console.log('========================');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Timezone: ${process.env.TZ || 'UTC'}`);
console.log(`Current time: ${new Date().toISOString()}\n`);

fixExistingOrderTimestamps();
