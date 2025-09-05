const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { processImageUpload, deleteFromCloudinary } = require('../utils/imageUpload');

exports.list = catchAsync(async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
  const categories = await Category.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ results: categories.length, categories });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const idOrSlug = req.params.id;
  
  // Build query based on whether it's a valid ObjectId or slug
  const mongoose = require('mongoose');
  let query;
  
  if (mongoose.isValidObjectId(idOrSlug)) {
    // If it's a valid ObjectId, search by both _id and slug
    query = { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] };
  } else {
    // If it's not a valid ObjectId, search only by slug
    query = { slug: idOrSlug };
  }
  
  const category = await Category.findOne(query);
  if (!category) return next(new ApiError('Category not found', 404));
  res.status(200).json({ category });
});

exports.create = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;
  
  if (!name) {
    return next(new ApiError('Category name is required', 400));
  }
  
  let image;
  if (req.file) {
    try {
      console.log('📁 Starting image upload for category creation...');
      image = await processImageUpload(req.file, 'pizza-home/categories');
      console.log('✅ Image upload completed for category creation');
    } catch (error) {
      console.error('❌ Category image upload failed:', {
        originalError: error.message,
        fileName: req.file?.originalname,
        fileSize: req.file?.size,
        stack: error.stack
      });
      
      // Provide more specific error messages based on the type of error
      let errorMessage = 'Failed to upload image';
      if (error.message.includes('timing issue') || error.message.includes('Stale request')) {
        errorMessage = 'Image upload failed due to a temporary server issue. Please try again in a moment.';
      } else if (error.message.includes('Invalid image format')) {
        errorMessage = 'Invalid image format. Please upload a JPG, PNG, or WebP image.';
      } else if (error.message.includes('service configuration')) {
        errorMessage = 'Image upload service is temporarily unavailable. Please try again later.';
      }
      
      return next(new ApiError(errorMessage, 500));
    }
  }
  
  const category = await Category.create({ name, description, image });
  console.log('✅ Category created successfully:', category._id);
  res.status(201).json({ category });
});

exports.update = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const category = await Category.findById(id);
  if (!category) return next(new ApiError('Category not found', 404));

  const { name, description } = req.body;
  if (typeof name === 'string') category.name = name;
  if (typeof description === 'string') category.description = description;

  if (req.file) {
    console.log('📁 Starting image update for category:', id);
    
    // Store old image info for potential rollback
    const oldImage = category.image;
    
    try {
      // Upload new image first
      console.log('📄 Uploading new image...');
      const newImage = await processImageUpload(req.file, 'pizza-home/categories');
      
      // If upload successful, delete old image
      if (oldImage && oldImage.publicId) {
        try {
          console.log('🗾 Deleting old image:', oldImage.publicId);
          await deleteFromCloudinary(oldImage.publicId);
          console.log('✅ Old image deleted successfully');
        } catch (deleteError) {
          console.warn('⚠️ Failed to delete old image (continuing with update):', deleteError.message);
          // Don't fail the entire operation if old image deletion fails
        }
      }
      
      // Update category with new image
      category.image = newImage;
      console.log('✅ Image update completed for category:', id);
      
    } catch (uploadError) {
      console.error('❌ Category image update failed:', {
        categoryId: id,
        originalError: uploadError.message,
        fileName: req.file?.originalname,
        fileSize: req.file?.size
      });
      
      // Provide specific error message based on error type
      let errorMessage = 'Failed to upload new image';
      if (uploadError.message.includes('timing issue') || uploadError.message.includes('Stale request')) {
        errorMessage = 'Image upload failed due to a temporary server issue. Please try again in a moment.';
      } else if (uploadError.message.includes('Invalid image format')) {
        errorMessage = 'Invalid image format. Please upload a JPG, PNG, or WebP image.';
      } else if (uploadError.message.includes('service configuration')) {
        errorMessage = 'Image upload service is temporarily unavailable. Please try again later.';
      }
      
      return next(new ApiError(errorMessage, 500));
    }
  }

  await category.save();
  console.log('✅ Category updated successfully:', id);
  res.status(200).json({ category });
});

exports.remove = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const category = await Category.findById(id);
  if (!category) return next(new ApiError('Category not found', 404));
  
  // Delete image from Cloudinary if exists
  if (category.image && category.image.publicId) {
    try {
      await deleteFromCloudinary(category.image.publicId);
    } catch (error) {
      console.warn('Failed to delete image from Cloudinary:', error);
    }
  }
  
  await category.deleteOne();
  res.status(204).send();
});
