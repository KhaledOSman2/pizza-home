const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/Order');
const { getCairoTime, createValidDate, formatArabicDate } = require('../utils/dateUtils');

// Load environment variables
dotenv.config({ path: require('path').join(__dirname, '..', '..', '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const fixOrderDates = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Analyzing orders for date issues...');
    
    const now = getCairoTime();
    console.log(`📅 Current Cairo time: ${formatArabicDate(now)}`);
    console.log(`📅 Current UTC time: ${now.toISOString()}`);
    
    // Find orders with future dates
    const futureOrders = await Order.find({
      $or: [
        { createdAt: { $gt: now } },
        { updatedAt: { $gt: now } },
        { 'statusHistory.timestamp': { $gt: now } }
      ]
    });
    
    console.log(`\n🔍 Found ${futureOrders.length} orders with potential future date issues`);
    
    if (futureOrders.length === 0) {
      console.log('✅ No orders with future dates found. All dates appear to be correct.');
      process.exit(0);
    }
    
    console.log('\n📋 Orders with future dates:');
    console.log('═'.repeat(80));
    
    let fixedOrdersCount = 0;
    
    for (const order of futureOrders) {
      console.log(`\n📦 Order #${order.orderNumber || order._id.toString().slice(-6)}`);
      console.log(`   Customer: ${order.customer.name}`);
      
      let orderFixed = false;
      
      // Check and fix createdAt
      if (order.createdAt > now) {
        const oldDate = order.createdAt;
        const newDate = createValidDate();
        console.log(`   ⚠️ Future createdAt: ${formatArabicDate(oldDate)} → ${formatArabicDate(newDate)}`);
        order.createdAt = newDate;
        orderFixed = true;
      }
      
      // Check and fix updatedAt
      if (order.updatedAt > now) {
        const oldDate = order.updatedAt;
        const newDate = createValidDate();
        console.log(`   ⚠️ Future updatedAt: ${formatArabicDate(oldDate)} → ${formatArabicDate(newDate)}`);
        order.updatedAt = newDate;
        orderFixed = true;
      }
      
      // Check and fix status history timestamps
      let statusHistoryFixed = false;
      for (let i = 0; i < order.statusHistory.length; i++) {
        const historyItem = order.statusHistory[i];
        if (historyItem.timestamp > now) {
          const oldDate = historyItem.timestamp;
          const newDate = createValidDate();
          console.log(`   ⚠️ Future status history [${i}]: ${formatArabicDate(oldDate)} → ${formatArabicDate(newDate)}`);
          order.statusHistory[i].timestamp = newDate;
          statusHistoryFixed = true;
          orderFixed = true;
        }
      }
      
      if (orderFixed) {
        try {
          await order.save();
          console.log(`   ✅ Order fixed successfully`);
          fixedOrdersCount++;
        } catch (error) {
          console.log(`   ❌ Failed to fix order: ${error.message}`);
        }
      } else {
        console.log(`   ℹ️ Order dates are within acceptable range`);
      }
    }
    
    console.log('\n═'.repeat(80));
    console.log(`\n🎉 Date fixing completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Orders analyzed: ${futureOrders.length}`);
    console.log(`   - Orders fixed: ${fixedOrdersCount}`);
    console.log(`   - Orders skipped: ${futureOrders.length - fixedOrdersCount}`);
    
    // Verify the fix by checking for remaining future dates
    const remainingFutureOrders = await Order.find({
      $or: [
        { createdAt: { $gt: now } },
        { updatedAt: { $gt: now } },
        { 'statusHistory.timestamp': { $gt: now } }
      ]
    });
    
    if (remainingFutureOrders.length === 0) {
      console.log(`\n✅ Verification successful: No future dates remaining in database`);
    } else {
      console.log(`\n⚠️ Warning: ${remainingFutureOrders.length} orders still have future dates`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing order dates:', error);
    process.exit(1);
  }
};

const analyzeOrderDates = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Analyzing all order dates...');
    
    const now = getCairoTime();
    const totalOrders = await Order.countDocuments();
    
    // Get date statistics
    const orders = await Order.find({}, 'createdAt updatedAt statusHistory').lean();
    
    let futureCreatedAt = 0;
    let futureUpdatedAt = 0;
    let futureStatusHistory = 0;
    
    orders.forEach(order => {
      if (order.createdAt > now) futureCreatedAt++;
      if (order.updatedAt > now) futureUpdatedAt++;
      
      if (order.statusHistory) {
        order.statusHistory.forEach(history => {
          if (history.timestamp > now) futureStatusHistory++;
        });
      }
    });
    
    console.log('\n📊 Date Analysis Report:');
    console.log('═'.repeat(50));
    console.log(`📅 Current time: ${formatArabicDate(now)}`);
    console.log(`📦 Total orders: ${totalOrders}`);
    console.log(`⚠️ Orders with future createdAt: ${futureCreatedAt}`);
    console.log(`⚠️ Orders with future updatedAt: ${futureUpdatedAt}`);
    console.log(`⚠️ Status history items with future timestamps: ${futureStatusHistory}`);
    
    if (futureCreatedAt > 0 || futureUpdatedAt > 0 || futureStatusHistory > 0) {
      console.log(`\n💡 Run this script with the 'fix' argument to correct these issues:`);
      console.log(`   node backend/src/scripts/fixOrderDates.js fix`);
    } else {
      console.log(`\n✅ All dates are correct!`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error analyzing order dates:', error);
    process.exit(1);
  }
};

// Check command line arguments
const action = process.argv[2];

if (action === 'fix') {
  fixOrderDates();
} else {
  console.log('📋 Order Date Analysis and Fix Tool');
  console.log('═'.repeat(50));
  console.log('Usage:');
  console.log('  node fixOrderDates.js        - Analyze order dates');
  console.log('  node fixOrderDates.js fix    - Fix future dates');
  console.log('');
  
  analyzeOrderDates();
}
