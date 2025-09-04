/* eslint-disable no-console */
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in .env');
    }

    await connectDB();

    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      admin = await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
      console.log('Admin user created:', { id: admin.id, email: admin.email });
    } else {
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        if (ADMIN_PASSWORD) admin.password = ADMIN_PASSWORD; // reset password if provided
        await admin.save();
        console.log('Existing user promoted to admin and updated:', { id: admin.id, email: admin.email });
      } else {
        console.log('Admin user already exists:', { id: admin.id, email: admin.email });
      }
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed admin failed:', err.message);
    process.exit(1);
  }
})();
