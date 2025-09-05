const express = require('express');
const { getCurrentServerTime, getCurrentCairoTime, formatOrderDate } = require('../utils/dateHelpers');

const router = express.Router();

// Debug endpoint to check server time and timezone
router.get('/time-debug', (req, res) => {
  const serverTime = getCurrentServerTime();
  const cairoTime = getCurrentCairoTime();
  
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
      utc: {
        iso: new Date().toISOString(),
        timestamp: Date.now()
      }
    },
    timezoneOffset: {
      server: serverTime.getTimezoneOffset(),
      cairo: cairoTime.getTimezoneOffset()
    }
  });
});

module.exports = router;
