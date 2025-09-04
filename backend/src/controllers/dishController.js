const mongoose = require('mongoose');
const Dish = require('../models/Dish');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { processImageUpload, deleteFromCloudinary } = require('../utils/imageUpload');

exports.list = catchAsync(async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const categoryParam = (req.query.category || '').toString().trim();
  const includeUnavailable = req.query.includeUnavailable === 'true'; // Admin can see all

  const filter = {};
  
  // Only show available dishes for regular users (not admin requests)
  if (!includeUnavailable) {
    filter.isAvailable = true;
  }
  
  if (q) filter.name = { $regex: q, $options: 'i' };
  if (categoryParam) {
    let categoryId = null;
    if (mongoose.Types.ObjectId.isValid(categoryParam)) {
      categoryId = categoryParam;
    } else {
      const cat = await Category.findOne({ slug: categoryParam });
      if (cat) categoryId = cat._id;
    }
    if (categoryId) filter.category = categoryId;
    else return res.status(200).json({ results: 0, dishes: [] });
  }

  const dishes = await Dish.find(filter).populate('category', 'name slug');
  res.status(200).json({ results: dishes.length, dishes });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const idOrSlug = req.params.id;
  const includeUnavailable = req.query.includeUnavailable === 'true'; // Admin can see unavailable dishes
  
  let dish;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    dish = await Dish.findById(idOrSlug).populate('category', 'name slug');
  }
  if (!dish) dish = await Dish.findOne({ slug: idOrSlug }).populate('category', 'name slug');
  
  if (!dish) return next(new ApiError('Dish not found', 404));
  
  // If dish is not available and this is not an admin request, return 404
  if (!dish.isAvailable && !includeUnavailable) {
    return next(new ApiError('Dish not available', 404));
  }
  
  res.status(200).json({ dish });
});

exports.create = catchAsync(async (req, res, next) => {
  const { name, description, price, category, rating, prepTimeMin, serves, ingredients, isAvailable } = req.body;
  if (!name || !price || !category) return next(new ApiError('name, price and category are required', 400));

  const cat = await Category.findById(category);
  if (!cat) return next(new ApiError('Invalid category', 400));

  let image;
  if (req.file) {
    try {
      image = await processImageUpload(req.file, 'pizza-home/dishes');
    } catch (error) {
      return next(new ApiError('Failed to upload image', 500));
    }
  }
  
  const dish = await Dish.create({
    name,
    description,
    price,
    category: cat._id,
    image,
    rating,
    prepTimeMin,
    serves,
    ingredients,
    isAvailable,
  });

  res.status(201).json({ dish });
});

exports.update = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const dish = await Dish.findById(id);
  if (!dish) return next(new ApiError('Dish not found', 404));

  const { name, description, price, category, rating, prepTimeMin, serves, ingredients, isAvailable } = req.body;
  if (typeof name === 'string') dish.name = name;
  if (typeof description === 'string') dish.description = description;
  if (price !== undefined) dish.price = price;
  if (typeof rating !== 'undefined') dish.rating = rating;
  if (typeof prepTimeMin !== 'undefined') dish.prepTimeMin = prepTimeMin;
  if (typeof serves !== 'undefined') dish.serves = serves;
  if (typeof isAvailable !== 'undefined') dish.isAvailable = isAvailable;
  if (Array.isArray(ingredients)) dish.ingredients = ingredients;
  if (category) {
    const cat = await Category.findById(category);
    if (!cat) return next(new ApiError('Invalid category', 400));
    dish.category = cat._id;
  }

  if (req.file) {
    // Delete old image if exists
    if (dish.image && dish.image.publicId) {
      try {
        await deleteFromCloudinary(dish.image.publicId);
      } catch (error) {
        console.warn('Failed to delete old image:', error);
      }
    }
    
    // Upload new image
    try {
      dish.image = await processImageUpload(req.file, 'pizza-home/dishes');
    } catch (error) {
      return next(new ApiError('Failed to upload new image', 500));
    }
  }

  await dish.save();
  res.status(200).json({ dish });
});

exports.remove = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const dish = await Dish.findById(id);
  if (!dish) return next(new ApiError('Dish not found', 404));
  
  // Delete image from Cloudinary if exists
  if (dish.image && dish.image.publicId) {
    try {
      await deleteFromCloudinary(dish.image.publicId);
    } catch (error) {
      console.warn('Failed to delete image from Cloudinary:', error);
    }
  }
  
  await dish.deleteOne();
  res.status(204).send();
});
