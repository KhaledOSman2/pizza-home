const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use memory storage instead of Cloudinary storage to avoid timestamp issues
const storage = multer.memoryStorage();

// Configure multer with file size limits and error handling
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only allow 1 file at a time
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      // Additional check for allowed extensions
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const fileExtension = path.extname(file.originalname).toLowerCase();
      
      if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG, WEBP, and GIF files are allowed.'), false);
      }
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Error handling middleware for multer errors
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Image file size must be less than 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Only one file can be uploaded at a time'
      });
    }
  }
  
  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message
    });
  }
  
  next(error);
};

module.exports = { upload, handleUploadErrors };
