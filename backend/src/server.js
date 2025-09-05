/* eslint-disable no-console */
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

// Set timezone to Cairo/Egypt for consistent timestamp handling
process.env.TZ = process.env.TZ || 'Africa/Cairo';

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

(async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Pizza Home API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! Shutting down...', err);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
