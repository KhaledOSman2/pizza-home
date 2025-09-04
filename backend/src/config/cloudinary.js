const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary with environment variables and optimized settings
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS URLs
  timeout: 120000, // 2 minutes timeout
  chunk_size: 6000000, // 6MB chunk size for uploads
  // Disable strict timestamp validation to prevent stale request errors
  sign_url: false,
  long_url_signature: false,
  // Additional configuration to handle timezone and timestamp issues
  use_auto_timestamp: false,
  timestamp_validation: false
});

// Validate configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️  Cloudinary configuration incomplete. Please check environment variables:');
  console.warn('   - CLOUDINARY_CLOUD_NAME');
  console.warn('   - CLOUDINARY_API_KEY');
  console.warn('   - CLOUDINARY_API_SECRET');
} else {
  console.log('✅ Cloudinary configured successfully');
}

module.exports = cloudinary;
