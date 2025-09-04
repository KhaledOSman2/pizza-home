const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    image: {
      url: String,
      publicId: String,
    },
  },
  { timestamps: true }
);

categorySchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  // Create slug from name, handling Arabic text
  let slug = this.name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
  
  // If the result is empty or contains only non-alphanumeric characters,
  // use a fallback based on the ObjectId
  if (!slug || slug.replace(/[^a-z0-9\u0600-\u06FF]/g, '').length === 0) {
    slug = `category-${Date.now()}`;
  }
  
  this.slug = slug;
  next();
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
