const cloudinary = require('../config/cloudinary');
const crypto = require('crypto');

/**
 * Generate a simple file name to avoid timestamp issues
 * @returns {string} Simple filename
 */
const generateSimpleFilename = () => {
  return `img_${crypto.randomBytes(8).toString('hex')}`;
};

/**
 * Upload image buffer to Cloudinary with emergency base64 fallback
 * @param {Buffer} buffer - Image buffer from multer
 * @param {string} folder - Cloudinary folder name (optional)
 * @param {string} publicId - Custom public ID (optional)
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = async (buffer, folder = 'pizza-home', publicId = null) => {
  // Convert buffer to base64 data URI
  const base64String = buffer.toString('base64');
  const dataURI = `data:image/jpeg;base64,${base64String}`;
  
  console.log('🔄 Attempting Cloudinary upload...');
  
  try {
    // Try the simplest possible upload
    const simpleOptions = {
      public_id: publicId || `simple_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      folder: folder,
      resource_type: 'auto'
    };
    
    const result = await cloudinary.uploader.upload(dataURI, simpleOptions);
    console.log('✅ Simple upload successful:', result.public_id);
    return result;
    
  } catch (cloudinaryError) {
    console.warn('⚠️ Cloudinary upload failed:', cloudinaryError.message);
    
    // Emergency fallback: return a base64 data URL as the image URL
    // This allows the app to continue working while the timestamp issue is resolved
    console.log('🆘 Using emergency base64 fallback...');
    
    const emergencyId = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Create a mock Cloudinary response structure with base64 data
    const fallbackResult = {
      public_id: emergencyId,
      secure_url: dataURI, // Use base64 data URL as fallback
      url: dataURI,
      format: 'jpeg',
      width: 800, // Default values
      height: 600,
      bytes: buffer.length,
      created_at: new Date().toISOString(),
      resource_type: 'image'
    };
    
    console.log('✅ Emergency fallback active - app will continue working with base64 images');
    console.log('⚠️ Note: Images are stored as base64 data until Cloudinary timestamp issue is resolved');
    
    return fallbackResult;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Process uploaded file and upload to Cloudinary
 * @param {Object} file - Multer file object
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Object>} Image data with URL and public ID
 */
const processImageUpload = async (file, folder = 'pizza-home') => {
  if (!file || !file.buffer) {
    throw new Error('No file provided or file buffer is missing');
  }

  console.log('📷 Processing image upload:', {
    originalName: file.originalname,
    size: file.buffer.length,
    folder: folder
  });

  try {
    const result = await uploadToCloudinary(file.buffer, folder);
    
    const imageData = {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
    
    // Check if we're using emergency fallback
    if (result.secure_url.startsWith('data:')) {
      console.log('⚠️ Image stored as base64 data (emergency mode)');
      console.log('💡 To fix: Synchronize system time with: w32tm /resync');
    } else {
      console.log('✅ Image processing completed:', imageData.publicId);
    }
    return imageData;
    
  } catch (error) {
    console.error('❌ Image upload processing error:', error);
    
    // Handle specific error types
    if (error.message && error.message.includes('Stale request')) {
      throw new Error('Upload failed due to timing issue. Please refresh the page and try again.');
    }
    
    if (error.message && error.message.includes('timestamp validation')) {
      throw new Error('Server time synchronization issue detected. Please contact support.');
    }
    
    if (error.http_code === 400) {
      throw new Error('Invalid image format. Please use JPG, PNG, or WebP images.');
    }
    
    if (error.http_code === 401 || error.message.includes('api_key')) {
      throw new Error('Image service configuration error. Please contact support.');
    }
    
    if (error.http_code === 403) {
      throw new Error('Upload limit exceeded. Please try again later.');
    }
    
    // Generic error for all other cases
    throw new Error('Failed to upload image. Please try again.');
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  processImageUpload
};