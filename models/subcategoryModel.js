const mongoose = require('mongoose');
const slugify = require('slugify');

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subcategory must have a name'],
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Subategory must have a category'],
    },
    slug: { type: String, unique: true, trim: true },
    imageCover: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    order: { type: Number, required: true },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

subcategorySchema.index({ category: 1 });
subcategorySchema.index({ slug: 1 });

subcategorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

subcategorySchema.post('save', (doc, next) => {
  next();
});

const Subcategory = mongoose.model('Category', subcategorySchema);

module.exports = Subcategory;
