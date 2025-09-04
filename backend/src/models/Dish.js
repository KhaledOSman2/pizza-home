const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image: {
      url: String,
      publicId: String,
    },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
    prepTimeMin: { type: Number, default: 15 },
    serves: { type: Number, default: 1 },
    ingredients: [{ type: String, trim: true }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

dishSchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  // Create slug from name, handling Arabic text
  let slug = this.name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
  
  // If the result is empty or contains only non-alphanumeric characters,
  // use a fallback based on the ObjectId and timestamp
  if (!slug || slug.replace(/[^a-z0-9\u0600-\u06FF]/g, '').length === 0) {
    slug = `dish-${Date.now()}`;
  }
  
  this.slug = slug;
  next();
});

const Dish = mongoose.model('Dish', dishSchema);
module.exports = Dish;
