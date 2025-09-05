const express = require('express');
const { getCurrentServerTime, getCurrentCairoTime, formatOrderDate } = require('../utils/dateHelpers');
const { createTimestamp, getCairoTime } = require('../middleware/timestampOverride');
const Order = require('../models/Order');

const router = express.Router();

// Debug endpoint to check server time and timezone
router.get('/time-debug', (req, res) => {
  const serverTime = getCurrentServerTime();
  const cairoTime = getCurrentCairoTime();
  
  const controlledTime = createTimestamp();
  
  res.json({
    serverInfo: {
      environment: process.env.NODE_ENV || 'development',
      timezone: process.env.TZ || 'UTC (system default)',
      platform: process.platform,
      nodeVersion: process.version
    },
    timestamps: {
      serverTime: {
        iso: serverTime.toISOString(),
        local: serverTime.toString(),
        formatted: formatOrderDate(serverTime)
      },
      cairoTime: {
        iso: cairoTime.toISOString(),
        local: cairoTime.toString(),
        formatted: formatOrderDate(cairoTime)
      },
      controlledTime: {
        iso: controlledTime.toISOString(),
        local: controlledTime.toString(),
        formatted: formatOrderDate(controlledTime)
      },
      utc: {
        iso: new Date().toISOString(),
        timestamp: Date.now()
      }
    },
    timezoneOffset: {
      server: serverTime.getTimezoneOffset(),
      cairo: cairoTime.getTimezoneOffset(),
      controlled: controlledTime.getTimezoneOffset()
    }
  });
});

// Test order creation endpoint
router.post('/test-order', async (req, res) => {
  try {
    const now = createTimestamp();
    
    // Create a test order to verify timestamp behavior
    const testOrderData = {
      customer: {
        name: 'Test Customer',
        phone: '01234567890',
        address: 'Test Address, Cairo, Egypt'
      },
      items: [{
        dish: '507f1f77bcf86cd799439011', // Dummy ObjectId
        name: 'Test Pizza',
        price: 50,
        quantity: 1
      }],
      subtotal: 50,
      deliveryFee: 10,
      total: 60,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };

    console.log('🧪 Creating test order with controlled timestamp:', {
      controlledTime: now.toISOString(),
      systemTime: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });

    // Create without saving to database
    const testOrder = new Order(testOrderData);
    
    // Check what timestamps MongoDB would assign
    const simulatedSave = {
      beforeSave: {
        createdAt: testOrder.createdAt?.toISOString(),
        updatedAt: testOrder.updatedAt?.toISOString()
      }
    };

    res.json({
      success: true,
      message: 'Test order creation simulation',
      controlledTimestamp: now.toISOString(),
      systemTimestamp: new Date().toISOString(),
      testOrder: {
        customer: testOrder.customer,
        createdAt: testOrder.createdAt?.toISOString(),
        updatedAt: testOrder.updatedAt?.toISOString(),
        total: testOrder.total
      },
      simulation: simulatedSave,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Test order creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
